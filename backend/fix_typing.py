import os

def fix_dir(path):
    for root, _, files in os.walk(path):
        if 'venv' in root:
            continue
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                if ' | None' in content and 'from __future__ import annotations' not in content:
                    with open(filepath, 'w') as f:
                        f.write('from __future__ import annotations\n' + content)
                    print(f"Fixed {filepath}")

fix_dir('.')
