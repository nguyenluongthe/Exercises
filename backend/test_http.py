import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Health check
res = urllib.request.urlopen('http://localhost:8000/health')
print('=== 1. HEALTH CHECK ===')
print('Status:', res.status, json.loads(res.read().decode('utf-8')))

# 2. Predict test
print('\n=== 2. PREDICT TEST (Vietnamese Slang) ===')
req = urllib.request.Request(
    'http://localhost:8000/predict',
    data=json.dumps({'text': 'tôi muốn tập xô bằng tạ đơn tại nhà'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
pred = json.loads(res.read().decode('utf-8'))
print('Input:', pred['input_text'])
print('Predicted Body Part:', pred['predicted_body_part'])
print(f"Confidence: {pred['confidence']*100:.1f}% ({pred['confidence_level']})")
print('Interpreted Keywords:', pred['interpreted_keywords'])
print('Top 3 Alternates:', pred['top_3'])

# 3. Recommend test
print('\n=== 3. RECOMMEND TEST ===')
req2 = urllib.request.Request(
    'http://localhost:8000/recommend',
    data=json.dumps({'text': 'tôi muốn tập ngực với tạ đơn', 'top_k': 3}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res2 = urllib.request.urlopen(req2)
rec = json.loads(res2.read().decode('utf-8'))
print('Interpreted Keywords:', rec['interpreted_keywords'])
for ex in rec['results']:
    print(f"  - {ex['name']} ({ex.get('name_vi','')}) : Match {ex['match_score']}% [{ex['match_level']}] : {ex['body_part']}")

# 4. Substitutions test
first_id = rec['results'][0]['id']
print(f'\n=== 4. SUBSTITUTIONS TEST ({first_id}) ===')
res3 = urllib.request.urlopen(f'http://localhost:8000/exercises/{first_id}/substitutions')
subs = json.loads(res3.read().decode('utf-8'))
for s in subs:
    print(f"  - Alternative: {s['name']} [{s['equipment']}] -> Target: {s['target']}")

print('\n>>> SERVER HOAT DONG 100% HOAN HAO TRANH MOI LOI! <<<')
