import os
import csv
import errno, sys

print("Starting processing quotes...\n")

def check_csv_files(directory):
    total_errors = 0
    for file_name in os.listdir(directory):
        if file_name.endswith(".csv"):
            filepath = os.path.join(directory, file_name)
            errors = 0

            with open(filepath, 'r', newline='', encoding="cp437") as csvfile:
                reader = csv.DictReader(csvfile, delimiter='|')
                rows = list(reader)
                linenum = 2 #ignore header row

                print(f"Processing {file_name}...")

                # Loop through the rows and find missing quote times
                for row in rows:
                    if 'Quote time' in row and 'Quote' in row:
                        if row['Quote time'] not in row['Quote']:
                            print("Line " + str(linenum) + ": " + row['Quote time'] + " " + row['Quote'])
                            errors += 1
                            if not row['Quote time'].startswith('*'):
                                row['Quote time'] = "* " + row['Quote time']
                    linenum += 1

            total_errors += errors

            print(f"- Lines: {len(rows) + 1}")
            print(f"- Errors found: {errors}\n")
    return total_errors

# check all CSV files in quotes directory
quotes_path = 'quotes/'
result = check_csv_files(quotes_path)

if result > 0:
    sys.exit(f"Error. {result} invalid quotes were found!")

print("Processing finished, all good!")
