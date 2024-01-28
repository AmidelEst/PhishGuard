def similar_string(input_str, string_list):
    import difflib

    # Find the most similar string using SequenceMatcher
    similarity_ratio = [difflib.SequenceMatcher(None, input_str, s).ratio() for s in string_list]

    # Get the index of the most similar string
    most_similar_index = similarity_ratio.index(max(similarity_ratio))

    # Return the most similar string
    return string_list[most_similar_index]

# Example usage:
input_string = "webrashim.hit.ac.il"
string_list = ["mihash", "hit.ac.il", "webrashim.hit.ac.il", "hit.webrashim.ac.il", "mihss"]
result = similar_string(input_string, string_list)
print("Most similar string:", result)
