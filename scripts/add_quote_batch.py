import csv
import os
import time
from googletrans import Translator
import httpcore
import pandas as pd
import argparse
from fuzzywuzzy import fuzz

# Initialize the translator
translator = Translator()

# Available language codes
languages = ["en-US", "es-ES", "pt-PT", "fr-FR", "it-IT", "de-DE"]

# Path to the folder where CSV files are stored
folder_path = 'quotes'

# Translate timeout (in seconds)
trans_timeout = 5

# Fuzzy quote match threshold
quote_match_threshold = 80

# Function to generate the ID based on the time and existing entries
def generate_id(time, lang_code):
    file_name = f'quotes.{lang_code}.csv'
    file_path = os.path.join(folder_path, file_name)
    
    # Initialize the count for the current time
    count = 0
    time_without_colon = time.replace(":", "")
    
    # Check how many entries exist with the same time
    if os.path.exists(file_path):
        with open(file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter='|')
            for row in reader:
                if row[0] == time:  # Assuming the time is in the first column
                    count += 1
    
    # Create the ID in the format HHMM-XXX
    print(f"Creating quote ID: {time_without_colon}-{count:03}")
    return f"{time_without_colon}-{count:03}"

# Function to append to CSV without affecting quotation marks
def append_csv_without_changing_quotes(file_path, data, delimiter='|'):
    with open(file_path, mode='a', newline='', encoding='utf-8') as csvfile:
            line = delimiter.join(data)
            csvfile.write(line + '\n')

# Function to add the translated quote, title, and quote time to the CSV files
def add_quote_to_csv(time_val, quote_time, quote, author, title, language_code, sfw_status):
    for lang_code in languages:
        
        src_lang_code = language_code.split('-')[0]
        dst_lang_code = dest=lang_code.split('-')[0]

        # Translate the quote, title, and quote time if the language is not the original
        if lang_code != language_code:
            retry_attempts = 0  # Number of retry attempts in case of failure
            while retry_attempts > 0:
                try:
                    translated_quote = translator.translate(quote, src=src_lang_code, dest=dst_lang_code, timeout=trans_timeout).text
                    translated_title = translator.translate(title, src=src_lang_code, dest=dst_lang_code, timeout=trans_timeout).text
                    translated_quote_time = translator.translate(quote_time, src=src_lang_code, dest=dst_lang_code, timeout=trans_timeout).text
                    break  # Break out of the loop if successful
                except (httpcore.ConnectTimeout, Exception) as e:
                    retry_attempts -= 1
                    if retry_attempts == 0:
                        # If all retries fail, use "NO TRANSLATED"
                        print(f"Translation failed after 3 attempts for {lang_code}. Setting 'NO TRANSLATED'.")
                        translated_quote = "NO TRANSLATED"
                        translated_title = "NO TRANSLATED"
                        translated_quote_time = "NO TRANSLATED"
                    else:
                        print(f"Timeout error. Retrying... {retry_attempts} attempts left.")
                        time.sleep(2)  # Wait for 2 seconds before retrying
        else:
            translated_quote = quote
            translated_title = title
            translated_quote_time = quote_time

        # Generate the ID for the new quote
        quote_id = generate_id(time_val, lang_code)

        # Open the corresponding CSV file and append the translated quote, title, and quote time
        file_name = f'quotes.{lang_code}.csv'
        file_path = os.path.join(folder_path, file_name)
        
        # Write to the CSV (ID, time, translated quote time, translated quote, translated title, author, sfw_status)
        append_csv_without_changing_quotes(file_path,[time_val, quote_id, translated_quote_time, translated_quote, translated_title, author, sfw_status])

# Function to check if the quote already exists for the specified time and language
def check_if_quote_exists(time_val, quote_str, lang_code):
    file_name = f'quotes.{lang_code}.csv'
    file_path = os.path.join(folder_path, file_name)
    
    with open(file_path, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter='|', quoting=csv.QUOTE_NONE)
        for row in reader:
            if row['Time'] == time_val and fuzz.partial_ratio(row['Quote'], quote_str) >= quote_match_threshold:
                print("Potential duplicate quote: " + time_val + " - " + quote_str )
                print("skipping...")
                return True
            
    return False


# Function to process quotes in batch from a CSV file (reading by column names)
def process_batch_csv(file_path, language_code):
    with open(file_path, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter='|', quoting=csv.QUOTE_NONE)  # Use DictReader to read by column name
        
        # First, count the total number of quotes
        total_quotes = sum(1 for _ in reader)
        
        # Reset the reader to start reading from the beginning again
        file.seek(0)
        reader = csv.DictReader(file, delimiter='|', quoting=csv.QUOTE_NONE)

        # Initialize a counter
        quote_counter = 1
        
        for row in reader:
            # Print the current quote number and the total
            print(f"Processing quote {quote_counter} of {total_quotes}...")

            time_val = row['Time']  # Match the CSV column name exactly
            quote_time = row['Quote time']  # Match the CSV column name exactly
            quote = row['Quote']
            author = row['Author']
            title = row['Title']
            sfw_status = row['SFW']  # Match the CSV column name exactly

            # check if quote already exists
            if not check_if_quote_exists(time_val, quote, language_code):
                # add quote to quotes csv
                add_quote_to_csv(time_val, quote_time, quote, author, title, language_code, sfw_status)

            # Increment the counter
            quote_counter += 1
            
def resort_csv():

    for lang_code in languages:

        # Open the language CSV file 
        file_name = f'quotes.{lang_code}.csv'
        file_path = os.path.join(folder_path, file_name)

        # Read the CSV file into a DataFrame
        df = pd.read_csv(file_path, delimiter='|', quoting=csv.QUOTE_NONE)

        # Sort the DataFrame by ColumnA, ColumnB, and ColumnC
        sorted_df = df.sort_values(by=['Time','Id'])

        # Write the sorted DataFrame back to a new CSV file
        sorted_df.to_csv(file_path, index=False, sep='|', quoting=csv.QUOTE_NONE)



if __name__ == "__main__":
    # Create the parser
    parser = argparse.ArgumentParser(description="Add a batch of quotes.")

    # Add the arguments
    parser.add_argument('--file', type=str, required=True, help='Batch file to import')
    parser.add_argument('--language', type=str, default='en-US', help='Language of quotes to import')

    # Parse the arguments
    args = parser.parse_args()

    process_batch_csv(args.file, args.language)
    resort_csv()


