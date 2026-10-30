#!/usr/bin/env python3
"""
Menu Asnaf - Gemini Food Image Generator
========================================
Generates realistic food photography for menu items using Google Gemini / Imagen API,
and saves permanent static PNG files directly into public/menu-images/ for GitHub Pages.

Usage:
  # 1. Set your Gemini API key:
  #    Windows Command Prompt: set GEMINI_API_KEY=your_key_here
  #    Windows PowerShell:     $env:GEMINI_API_KEY="your_key_here"

  # 2. Test 1 single item first:
  python scripts/generate_images.py --test

  # 3. Check progress status:
  python scripts/generate_images.py --status

  # 4. Generate in small batches (e.g. 5 items):
  python scripts/generate_images.py --batch-size 5

  # 5. Generate all remaining items:
  python scripts/generate_images.py --all
"""

import os
import sys
import json
import time
import base64
import argparse
from pathlib import Path
from urllib import request, error

# Root directory of the project
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
MENU_DATA_JSON = SCRIPT_DIR / "menu_items.json"
PROGRESS_FILE = SCRIPT_DIR / "generation_progress.json"
LOCAL_MAP_FILE = PROJECT_ROOT / "src" / "data" / "localGeneratedImages.json"
OUTPUT_DIR = PROJECT_ROOT / "public" / "menu-images"

# Default Model: can be overridden via --model or GEMINI_IMAGE_MODEL env var
DEFAULT_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "imagen-3.0-generate-002")

CATEGORY_HINTS = {
    "broasted": "Crispy golden fried broasted chicken with garlic sauce and fries",
    "grilled": "Charcoal grilled meats and chicken served on authentic platter with grilled tomatoes and fresh bread",
    "skewers_kg": "Authentic grilled meat skewers fresh off the charcoal grill with sumac, onions and flatbread",
    "meals": "Fast food meal combo with crispy burger or chicken, golden french fries and dip",
    "shawarma": "Traditional Arabic shawarma wrap sliced with tahini and pickles on plate",
    "sandwiches": "Gourmet freshly prepared sandwich in toasted bun with fresh ingredients",
    "pizza": "Authentic stone oven baked pizza with bubbly melted mozzarella cheese and savory toppings",
    "pasta": "Freshly prepared Italian pasta bowl with rich sauce and fresh herbs",
    "pies": "Traditional warm Arabic savory pastry and pie baked to golden perfection",
    "juices": "Freshly squeezed natural chilled fruit juice in clean glassware with fruit slice garnish",
    "hot_drinks": "Steaming hot traditional drink in glass cup with authentic aroma",
}


def load_menu_items():
    """Loads actual menu items from scripts/menu_items.json."""
    if not MENU_DATA_JSON.exists():
        print(f"[ERROR] Menu items data not found at: {MENU_DATA_JSON}")
        sys.exit(1)
    with open(MENU_DATA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("items", [])


def load_progress():
    """Loads existing progress state."""
    if PROGRESS_FILE.exists():
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"items": {}}


def save_progress(progress_data):
    """Saves progress state to scripts/generation_progress.json."""
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress_data, f, ensure_ascii=False, indent=2)


def load_local_map():
    """Loads mapping from src/data/localGeneratedImages.json."""
    if LOCAL_MAP_FILE.exists():
        try:
            with open(LOCAL_MAP_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_local_map(mapping):
    """Updates src/data/localGeneratedImages.json so Vite/React displays the image."""
    LOCAL_MAP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOCAL_MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)


def build_culinary_prompt(item):
    """Builds an appetizing culinary prompt for Gemini / Imagen."""
    name = item.get("name", "").strip()
    name_en = item.get("nameEn", "").strip()
    category = item.get("category", "")
    description = item.get("description", "").strip()

    hint = CATEGORY_HINTS.get(category, "Delicious restaurant food dish")

    prompt = (
        f"High-end commercial culinary food photography of {name}"
    )
    if name_en:
        prompt += f" ({name_en})"
    prompt += f". Category: {hint}. "

    if description:
        prompt += f"Dish description: {description}. "

    prompt += (
        "Visual style: Beautifully plated on clean restaurant tableware, shallow depth of field, "
        "warm natural culinary studio lighting, wooden or marble tabletop backdrop, "
        "vibrant fresh colors, appetizing 8k food presentation, 4:3 aspect ratio. "
        "STRICT NEGATIVE CONSTRAINTS: No text, no words, no letters, no logos, no watermarks, "
        "no prices, no borders, no hands, no human faces."
    )
    return prompt


def call_gemini_image_api(api_key, prompt, model_name=DEFAULT_MODEL):
    """
    Calls Google GenAI API to generate an image.
    Supports google-genai SDK if installed, or falls back to standard HTTP REST request.
    """
    # Attempt 1: Try modern google-genai SDK if available
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # If imagen model
        if "imagen" in model_name:
            result = client.models.generate_images(
                model=model_name,
                prompt=prompt,
                config=dict(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    output_mime_type="image/png",
                ),
            )
            for gen_img in result.generated_images:
                return gen_img.image.image_bytes
        else:
            # Gemini image generation model
            result = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            for part in result.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    return base64.b64decode(part.inline_data.data)
    except ImportError:
        pass  # SDK not installed, continue to REST fallback
    except Exception as e:
        err_str = str(e)
        # If model not supported via SDK method, fall back to REST
        if "404" in err_str or "not found" in err_str:
            pass
        else:
            raise e

    # Attempt 2: Standard REST API for Imagen (compatible with any Python install)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:predict?key={api_key}"
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "4:3",
            "outputOptions": {"mimeType": "image/png"},
        },
    }

    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=90) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            predictions = res_data.get("predictions", [])
            if predictions and "bytesBase64Encoded" in predictions[0]:
                return base64.b64decode(predictions[0]["bytesBase64Encoded"])
            raise RuntimeError(f"Unexpected response payload: {res_data}")
    except error.HTTPError as he:
        err_body = he.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {he.code}: {err_body}")


def generate_single_item(item, api_key, model_name=DEFAULT_MODEL, force=False):
    """Generates and saves image for a single item."""
    item_id = item["id"]
    item_name = item.get("name", item_id)
    target_filename = f"{item_id}.png"
    target_path = OUTPUT_DIR / target_filename
    rel_path = f"menu-images/{target_filename}"

    # Check if already exists
    if target_path.exists() and target_path.stat().st_size > 1000 and not force:
        print(f"[SKIP] Item '{item_name}' ({item_id}) already has an image: {rel_path}")
        return True, rel_path

    print(f"\n[GENERATING] Item: {item_name} ({item_id})...")
    prompt = build_culinary_prompt(item)
    print(f"  Prompt: {prompt[:90]}...")

    start_time = time.time()
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        image_bytes = call_gemini_image_api(api_key, prompt, model_name=model_name)

        if not image_bytes or len(image_bytes) < 1000:
            raise ValueError("Received invalid or empty image data from API")

        with open(target_path, "wb") as img_file:
            img_file.write(image_bytes)

        elapsed = round(time.time() - start_time, 2)
        print(f"  [SUCCESS] Saved: {target_path} ({len(image_bytes)//1024} KB in {elapsed}s)")

        # Update local map
        local_map = load_local_map()
        local_map[item_id] = rel_path
        save_local_map(local_map)

        # Update progress tracking
        progress = load_progress()
        progress.setdefault("items", {})[item_id] = {
            "status": "success",
            "name": item_name,
            "file": rel_path,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "size_bytes": len(image_bytes),
        }
        save_progress(progress)

        return True, rel_path
    except Exception as e:
        print(f"  [FAILED] Error generating '{item_name}': {e}")
        progress = load_progress()
        progress.setdefault("items", {})[item_id] = {
            "status": "error",
            "name": item_name,
            "error": str(e),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        save_progress(progress)
        return False, str(e)


def print_status(items):
    """Prints current generation status summary."""
    local_map = load_local_map()
    progress = load_progress()
    
    total = len(items)
    existing_files = 0
    for it in items:
        f = OUTPUT_DIR / f"{it['id']}.png"
        if f.exists() and f.stat().st_size > 1000:
            existing_files += 1

    mapped_count = len(local_map)
    pending_count = total - existing_files

    print("==================================================")
    print("  Menu Asnaf - Food Images Generation Status")
    print("==================================================")
    print(f"  Total Menu Items:        {total}")
    print(f"  Images on Disk:          {existing_files} / {total}")
    print(f"  Items Linked to Menu:    {mapped_count} / {total}")
    print(f"  Pending Items:           {pending_count}")
    print("==================================================")
    print(f"  Images folder:           {OUTPUT_DIR}")
    print(f"  Mapping file:            {LOCAL_MAP_FILE}")
    print("==================================================")


def main():
    parser = argparse.ArgumentParser(description="Generate food images for Menu Asnaf items")
    parser.add_argument("--test", action="store_true", help="Generate 1 test item only (br-1)")
    parser.add_argument("--item", type=str, help="Generate image for specific item ID (e.g. br-1)")
    parser.add_argument("--batch-size", type=int, default=5, help="Number of items to generate per batch (default: 5)")
    parser.add_argument("--all", action="store_true", help="Generate all remaining pending items")
    parser.add_argument("--force", action="store_true", help="Force re-generation of existing images")
    parser.add_argument("--status", action="store_true", help="Show current generation status")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help=f"Gemini/Imagen model (default: {DEFAULT_MODEL})")

    args = parser.parse_args()
    items = load_menu_items()

    if args.status:
        print_status(items)
        return

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        # Check local .env file
        env_file = PROJECT_ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                if line.startswith("GEMINI_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

    if not api_key:
        print("\n[ERROR] GEMINI_API_KEY is not set.")
        print("Please set your Gemini API key before running this script:")
        print("  Windows CMD:        set GEMINI_API_KEY=your_key_here")
        print("  Windows PowerShell: $env:GEMINI_API_KEY=\"your_key_here\"")
        print("  Linux / macOS:      export GEMINI_API_KEY=\"your_key_here\"\n")
        sys.exit(1)

    print(f"[INFO] Using Gemini model: {args.model}")

    # Mode 1: Test 1 item
    if args.test:
        test_item = items[0]  # br-1 (بروستد عادي 4 قطع)
        print(f"[TEST MODE] Generating single test item: {test_item['name']} ({test_item['id']})")
        success, _ = generate_single_item(test_item, api_key, model_name=args.model, force=args.force)
        if success:
            print("\n==================================================")
            print("[TEST COMPLETED SUCCESSFULLY!]")
            print(f"Image saved at: public/menu-images/{test_item['id']}.png")
            print("Refresh your browser to see the new image in the menu!")
            print("To continue generating in batches, run:")
            print("  python scripts/generate_images.py --batch-size 5")
            print("==================================================")
        return

    # Mode 2: Specific item
    if args.item:
        target = next((it for it in items if it["id"] == args.item), None)
        if not target:
            print(f"[ERROR] Item ID '{args.item}' not found in menu items.")
            sys.exit(1)
        generate_single_item(target, api_key, model_name=args.model, force=args.force)
        return

    # Mode 3: Batch or All
    pending = []
    for it in items:
        target_f = OUTPUT_DIR / f"{it['id']}.png"
        if not target_f.exists() or target_f.stat().st_size < 1000 or args.force:
            pending.append(it)

    if not pending:
        print("\n[DONE] All menu items already have valid generated images!")
        print_status(items)
        return

    to_process = pending if args.all else pending[: args.batch_size]
    print(f"\n[STARTING BATCH] Processing {len(to_process)} of {len(pending)} pending items...")

    success_count = 0
    fail_count = 0

    for i, it in enumerate(to_process, start=1):
        print(f"\n({i}/{len(to_process)}) Item {it['id']}: {it.get('name')}")
        ok, res = generate_single_item(it, api_key, model_name=args.model, force=args.force)
        if ok:
            success_count += 1
        else:
            fail_count += 1
            if "RESOURCE_EXHAUSTED" in str(res) or "429" in str(res):
                print("\n[STOPPING] Quota exceeded or rate limit reached. Halting batch safely.")
                break

        # Polite 2-second throttle delay between calls
        if i < len(to_process):
            time.sleep(2)

    print("\n==================================================")
    print(f"Batch completed: {success_count} succeeded, {fail_count} failed.")
    print("Run 'python scripts/generate_images.py --status' to view overall progress.")
    print("==================================================")


if __name__ == "__main__":
    main()
