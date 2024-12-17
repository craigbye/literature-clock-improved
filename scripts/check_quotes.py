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
                reader = csv.DictReader(csvfile, delimiter='|', quoting=csv.QUOTE_NONE)
                rows = list(reader)
                linenum = 2 #ignore header row

                print(f"Processing {file_name}...")

                # Loop through the rows and find missing quote times, and correct number of columns
                for row in rows:
                    # check for correct number of columns
                    if len(row) != 7:
                        print("Incorrect column count line " + str(linenum) + ": " + row['Quote'])
                        errors += 1

                    
                    # check if quote time is present in quote itself
                    if 'Quote time' in row and 'Quote' in row:
                        if row['Quote time'] not in row['Quote']:
                            print("Missing quote time line " + str(linenum) + ": " + row['Quote time'] + " " + row['Quote'])
                            errors += 1
                            if not row['Quote time'].startswith('*'):
                                row['Quote time'] = "* " + row['Quote time']

                    # check if matching number of quotation marks
                    if row['Quote'].count('"') % 2 != 0:
                        print("Unbalanced quotation marks line " + str(linenum) + ": " + row['Quote'])
                        errors += 1

                    #check if any fields are empty
                    if (not row['Time'] or 
                        not row['Quote time'] or
                        not row['Quote'] or
                        not row['Author'] or
                        not row['Title'] or
                        not row['SFW']):
                        print("Empty field line " + str(linenum) + ": " + row['Quote'])
                        errors += 1

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
