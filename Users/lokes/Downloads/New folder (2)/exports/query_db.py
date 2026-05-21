import sqlite3
import json

conn = sqlite3.connect(r'C:\Users\lokes\Downloads\New folder (2)\alphaveto\enquiries\enquiries.db')
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print('Tables:', tables)

for t in tables:
    table_name = t[0]
    print(f'\n--- {table_name} ---')
    c.execute(f'SELECT * FROM {table_name}')
    desc = [d[0] for d in c.description]
    print('Columns:', desc)
    rows = c.fetchall()
    print(f'Rows: {len(rows)}')
    for row in rows:
        print(row)

conn.close()
