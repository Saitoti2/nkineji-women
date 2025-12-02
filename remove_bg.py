#!/usr/bin/env python3
"""Remove background from logo image"""
try:
    from rembg import remove
    from PIL import Image
    import sys

    input_path = 'public/logo.jpg'
    output_path = 'public/logo.png'
    
    print(f"Processing {input_path}...")
    with open(input_path, 'rb') as input_file:
        input_data = input_file.read()
        output_data = remove(input_data)
    
    with open(output_path, 'wb') as output_file:
        output_file.write(output_data)
    
    print(f"✓ Background removed! Saved to {output_path}")
    sys.exit(0)
except ImportError as e:
    print(f"Error: {e}")
    print("Installing required packages...")
    import subprocess
    import sys
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'rembg', 'pillow', '--quiet'], check=True)
    print("Retrying...")
    from rembg import remove
    with open('public/logo.jpg', 'rb') as i:
        with open('public/logo.png', 'wb') as o:
            o.write(remove(i.read()))
    print("✓ Background removed! Saved to public/logo.png")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

