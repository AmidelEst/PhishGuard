from urllib.parse import urlparse

def extract_domain_from_url(url):
    parsed_url = urlparse(url)
    return parsed_url.netloc

# Example usage:
url = "https://chat.openai.com/c/c55df84f-bdbb-4a59-947f-6630c9d2371e"
domain = extract_domain_from_url(url)
print("Domain:", domain)
