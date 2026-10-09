# Source correction: Avtodor official signed Orders 53 and 54 (27 Feb 2026)

Date reverified **2026-10-10**. Official operator tariff effective **2026-03-02 00:00 Moscow time**.
- M1 `https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf` Order **54**: Category I 33–66km PVP46 **230 RUB every day**, cash/bank card/listed interoperable transponders. Previous catalog amount **250 RUB was class II**, wrong.
- M3 `https://avtodor-tr.ru/upload/iblock/cb5/9ag98rhzi0t9m0ix75q4o45e4urml5sf.pdf` Order **53**: Category I 65–86km PVP86 **100/100**, 112–150km PVP136 **190/190**, 150–194km PVP168 **190/230** for Mon–Thu / Fri–Sun (including official special holidays according to operator calendar). Earlier **M3 800 RUB FriSun was WRONG** because some values were class II or III. True three-row **480 RUB Mon–Thu, 520 RUB Fri–Sun**.
- The source uses same tariff for cash/card and listed interoperable transponders; private T-pass subscription/loyalty discounts not modeled. Always verify actual class/usage profile.
- Amended incorrectly transcribed `data/tolls/2026-10-01-avtodor-other-roads-category1.json` in place with explicit correction metadata; **no historical price guessing**. Other-road rows CKAD/A289 unchanged.
- National operator version checking is **per operator**. M1/M3 independently verified through `2026-10-10`; other six operator snapshots stay as-of `2026-10-09`. No using a blanket catalog update to prolong unrelated operator pricing evidence.
- Physical M3 booth proof is independent from money authorization. Even 520 RUB is an operator sum of the **three example section products only**, **not** proof that all selected-trip toll systems and billing exceptions were captured. Keep actual V2 customer toll UNKNOWN.
