# CloudFront Distribution for Property Images
resource "aws_cloudfront_distribution" "property_images" {
  origin {
    domain_name = aws_s3_bucket.property_images.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.property_images.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.property_images.cloudfront_access_identity_path
    }
  }

  enabled = true
  comment = "AuzLand Property Images CDN"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.property_images.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 86400      # 1 day
    default_ttl = 2592000    # 30 days
    max_ttl     = 31536000   # 1 year
  }

  # Cache behavior for image optimization
  ordered_cache_behavior {
    path_pattern           = "*.jpg"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.property_images.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 2592000    # 30 days
    default_ttl = 31536000   # 1 year
    max_ttl     = 31536000   # 1 year
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "AuzLand Property Images"
  }
}

# Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "property_images" {
  comment = "Property Images OAI"
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "property_images_policy" {
  bucket = aws_s3_bucket.property_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.property_images.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.property_images.arn}/*"
      }
    ]
  })
}

# Output CloudFront domain
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.property_images.domain_name
}