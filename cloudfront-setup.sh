#!/bin/bash

# CloudFront Distribution Setup for Property Images
echo "Setting up CloudFront distribution..."

# 1. Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "property-images-'$(date +%s)'",
  "Comment": "AuzLand Property Images CDN",
  "DefaultRootObject": "",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-property-images",
        "DomainName": "your-property-images-bucket.s3.ap-southeast-2.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-property-images",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 86400,
    "DefaultTTL": 2592000,
    "MaxTTL": 31536000,
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "Enabled": true,
  "PriceClass": "PriceClass_All"
}' --region us-east-1

echo "CloudFront distribution created. Update your image URLs to use CloudFront domain."