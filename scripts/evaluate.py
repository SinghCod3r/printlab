import sys
import os

print("Evaluator started", file=sys.stderr)
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

def evaluate(actual_path, expected_path):
    # Actually reading the images
    img1 = cv2.imread(actual_path, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(expected_path, cv2.IMREAD_GRAYSCALE)
    
    if img1 is None or img2 is None:
        return {"error": "Could not read images"}
        
    if img1.shape != img2.shape:
        img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
        
    s = ssim(img1, img2)
    
    mse = np.mean((img1 - img2) ** 2)
    if mse == 0:
        psnr = 100
    else:
        psnr = 20 * np.log10(255.0 / np.sqrt(mse))
        
    diff = cv2.absdiff(img1, img2)
    
    diff_path = actual_path + ".diff.png"
    cv2.imwrite(diff_path, diff)
    
    import json
    return json.dumps({"ssim": float(s), "psnr": float(psnr), "diff": diff_path})

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)
    res = evaluate(sys.argv[1], sys.argv[2])
    print(res)
