#!/usr/bin/env python3
"""Apply only on an isolated experiment checkout; default dry run, abort all conflicts."""
import argparse, hashlib, json, pathlib, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');a=p.parse_args()
root=pathlib.Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip())
branch=subprocess.check_output(['git','branch','--show-current'],cwd=root,text=True).strip()
if branch in ('main','master') or not branch:sys.exit('Use an isolated experimental branch.')
manifest=json.loads((pathlib.Path(__file__).parent/'road-availability-patch.json').read_text())
def blob(data):return hashlib.sha1(('blob '+str(len(data))+'\0').encode()+data).hexdigest()
planned=[]
for f in manifest['files']:
 target=root/f['path']
 if root not in target.resolve().parents:sys.exit('Invalid target path.')
 new=f['content'].encode();old=target.read_bytes() if target.exists() else None
 if old==new:continue
 if old is None and f['baseBlobSha'] is not None:sys.exit('Missing baseline file: '+f['path'])
 if old is not None and blob(old)!=f['baseBlobSha']:sys.exit('Conflicting source: '+f['path']+'; inspect/recover local changes, do not force.')
 planned.append((target,new))
print('Compatible files:',len(planned),'Apply:',a.apply)
if a.apply:
 for target,new in planned:
  target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(new)
 print('Applied sources. Recover/regenerate live fixture, run full gate/build, persist and verify exact Preview.')
