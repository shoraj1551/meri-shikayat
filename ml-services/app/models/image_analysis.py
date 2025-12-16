"""
Image quality analysis
"""

import cv2
import numpy as np
from PIL import Image
import io

class ImageAnalyzer:
    def __init__(self):
        self.min_width = 200
        self.min_height = 200
        self.max_size_mb = 10
    
    def analyze(self, image_bytes: bytes):
        """Analyze image quality"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {
                    "valid": False,
                    "error": "Invalid image format"
                }
            
            # Get image dimensions
            height, width = img.shape[:2]
            
            # Check size
            size_mb = len(image_bytes) / (1024 * 1024)
            
            # Blur detection (Laplacian variance)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            is_blurry = laplacian_var < 100
            blur_score = min(laplacian_var / 500, 1.0)
            
            # Brightness check
            brightness = np.mean(gray)
            is_too_dark = brightness < 50
            is_too_bright = brightness > 200
            brightness_score = 1.0 - abs(brightness - 128) / 128
            
            # Contrast check
            contrast = gray.std()
            is_low_contrast = contrast < 30
            contrast_score = min(contrast / 100, 1.0)
            
            # Overall quality score
            quality_score = (blur_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3)
            
            # Determine quality level
            if quality_score >= 0.7:
                quality_level = "good"
            elif quality_score >= 0.5:
                quality_level = "acceptable"
            else:
                quality_level = "poor"
            
            issues = []
            if is_blurry:
                issues.append("Image is blurry")
            if is_too_dark:
                issues.append("Image is too dark")
            if is_too_bright:
                issues.append("Image is too bright")
            if is_low_contrast:
                issues.append("Image has low contrast")
            if width < self.min_width or height < self.min_height:
                issues.append(f"Image resolution too low (minimum {self.min_width}x{self.min_height})")
            if size_mb > self.max_size_mb:
                issues.append(f"Image size too large (maximum {self.max_size_mb}MB)")
            
            return {
                "valid": True,
                "quality_score": float(quality_score),
                "quality_level": quality_level,
                "dimensions": {
                    "width": int(width),
                    "height": int(height)
                },
                "size_mb": float(size_mb),
                "metrics": {
                    "blur_score": float(blur_score),
                    "brightness": float(brightness),
                    "brightness_score": float(brightness_score),
                    "contrast": float(contrast),
                    "contrast_score": float(contrast_score)
                },
                "issues": issues,
                "recommendations": self._get_recommendations(issues)
            }
            
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
    
    def _get_recommendations(self, issues):
        """Get recommendations based on issues"""
        recommendations = []
        
        if any("blurry" in issue.lower() for issue in issues):
            recommendations.append("Hold camera steady or use better lighting")
        if any("dark" in issue.lower() for issue in issues):
            recommendations.append("Take photo in better lighting")
        if any("bright" in issue.lower() for issue in issues):
            recommendations.append("Avoid direct sunlight or flash")
        if any("contrast" in issue.lower() for issue in issues):
            recommendations.append("Ensure good lighting and clear subject")
        if any("resolution" in issue.lower() for issue in issues):
            recommendations.append("Use higher resolution camera or get closer")
        
        return recommendations

# Global instance
image_analyzer = ImageAnalyzer()
