import csv
from difflib import SequenceMatcher


# Function to calculate Jaccard similarity between two sets
def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0.0


# Function to create shingles from a given string
def create_shingles(input_str, k=3):
    shingles = set()
    for i in range(len(input_str) - k + 1):
        shingle = input_str[i:i + k]
        shingles.add(shingle)
    return shingles


# Function to calculate similarity using SequenceMatcher from difflib
def similarity_using_difflib(str1, str2):
    matcher = SequenceMatcher(None, str1, str2)
    return matcher.ratio()


# Path to your CSV file
csv_file_path = "Cites.csv"

# Given URL to find the most similar one
given_url = "https://chat.openai.com/c/71210b18-7e4f-4339-9d9f-a87f1cb1600b"

# Hyperparameters
threshold = 0.5

# Read URLs from the CSV file
with open(csv_file_path, 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    for row in csv_reader:
        if row:  # Ensure the row is not empty
            csv_url = row[0]

            # Calculate similarity using SequenceMatcher
            similarity = similarity_using_difflib(given_url, csv_url)

            # If similarity is above a certain threshold, consider it a match
            if similarity > threshold:
                print(f"Similarity with {csv_url}: {similarity}")
