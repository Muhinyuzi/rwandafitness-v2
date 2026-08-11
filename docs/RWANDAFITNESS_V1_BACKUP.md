**# RwandaFitness V1 — Backup Before V2 Deployment**

**\*\*Project:\*\*** RwandaFitness  
**\*\*Legacy version:\*\*** V1  
**\*\*Legacy stack:\*\*** Flask + SQLAlchemy + PostgreSQL  
**\*\*New version:\*\*** RwandaFitness V2 — Django + Django REST Framework + Next.js  
**\*\*Backup date:\*\*** August 11, 2026  
**\*\*Status:\*\*** ✅ Backup completed

**---**

**## 1. Purpose**

Before deploying RwandaFitness V2, the legacy RwandaFitness V1 application
and its PostgreSQL data were inspected and backed up.

The purpose of this backup is to:

\- preserve the historical RwandaFitness V1 database;
\- preserve the old articles;
\- preserve article photos and metadata;
\- allow future migration of selected articles to RwandaFitness V2;
\- provide a recovery point before replacing the Flask application;
\- avoid delaying the V2 deployment because of legacy content.

The historical articles do **\*\*not\*\*** need to be migrated before the V2 launch.

**---**

**# 2. Legacy Server**

RwandaFitness V1 is hosted on the existing DigitalOcean server.

SSH user:

\`\`\`text
muhinyuzi
\`\`\`

Server IP:

\`\`\`text
209.97.143.28
\`\`\`

Legacy project directory:

\`\`\`text
/home/muhinyuzi/rwandafitness
\`\`\`

Flask application directory:

\`\`\`text
/home/muhinyuzi/rwandafitness/web
\`\`\`

Flask configuration:

\`\`\`text
/home/muhinyuzi/rwandafitness/web/instance/flask.cfg
\`\`\`

**---**

**# 3. Locating the Legacy Project**

After connecting to the server through SSH, the following commands were used.

List the home directory:

\`\`\`bash
ls
\`\`\`

Result:

\`\`\`text
rwandafitness
\`\`\`

Search for RwandaFitness directories:

\`\`\`bash
find \~ -maxdepth 3 -type d -iname "\*rwandafitness\*" 2>/dev/null
\`\`\`

Result:

\`\`\`text
/home/muhinyuzi/rwandafitness
\`\`\`

Enter the project:

\`\`\`bash
cd \~/rwandafitness
\`\`\`

Inspect the directory:

\`\`\`bash
ls -lah
\`\`\`

The project contained:

\`\`\`text
.git
.gitignore
env
web
\`\`\`

**---**

**# 4. Inspecting the Legacy Flask Application**

The following command was used to inspect the main project files:

\`\`\`bash
find . -maxdepth 2 -type f | sort
\`\`\`

Important files found included:

\`\`\`text
./web/babel.cfg
./web/messages.pot
./web/requirements.txt
./web/run.py
./web/wsgi.py
\`\`\`

The Flask application itself is located under:

\`\`\`text
web/project/
\`\`\`

**---**

**# 5. Finding the Article Models**

The following search was used:

\`\`\`bash
grep -RniE "class Article|Article\\(" . \\
  --include="\*.py" \\
  --exclude-dir=venv \\
  --exclude-dir=.venv \\
  2>/dev/null
\`\`\`

Important results:

\`\`\`text
./web/project/models.py:342\:class Article(db.Model):
./web/project/models.py:599\:class ArticlePhoto(db.Model):
./web/project/models.py:816\:class ArticleVideo(db.Model):
\`\`\`

The article model was inspected with:

\`\`\`bash
cd \~/rwandafitness/web
\`\`\`

\`\`\`bash
sed -n '330,430p' project/models.py
\`\`\`

The photo model was inspected with:

\`\`\`bash
sed -n '590,650p' project/models.py
\`\`\`

The video model was inspected with:

\`\`\`bash
sed -n '805,860p' project/models.py
\`\`\`

**---**

**# 6. Legacy Article Architecture**

RwandaFitness V1 already supported bilingual article content.

The main table is:

\`\`\`text
articles
\`\`\`

Important fields include:

\`\`\`text
id
article\_title
en\_title
article\_category
en\_category
article\_summary
en\_summary
article\_content
en\_content
article\_video\_img
article\_video\_id
image\_filename
image\_url
date\_created
\`\`\`

The relationships are:

\`\`\`text
Article
   |
   +-- ArticlePhoto
   |
   +-- ArticleVideo
\`\`\`

Associated tables:

\`\`\`text
articlephotos
articlevideos
\`\`\`

This is important because the old architecture already contains both
Kinyarwanda and English content.

That makes migration to the RwandaFitness V2 architecture possible.

The V2 architecture uses:

\`\`\`text
Article
   |
   +-- ArticleTranslation (rw)
   |
   +-- ArticleTranslation (en)
\`\`\`

**---**

**# 7. Finding the Database Configuration**

Configuration files were searched using:

\`\`\`bash
find . -maxdepth 3 -type f \\( \\
  -name "\*.cfg" -o \\
  -name "config.py" -o \\
  -name ".env" -o \\
  -name "\*.ini" \\
\\) -print
\`\`\`

Important result:

\`\`\`text
./instance/flask.cfg
\`\`\`

The configuration was inspected on the server.

The production database configuration was identified as:

\`\`\`text
Database engine: PostgreSQL
Host: localhost
Port: 5432
Database: rwandafitness\_db
Database user: muhinyuzi
\`\`\`

Sensitive values such as passwords and secret keys are intentionally
excluded from this document.

**---**

**# 8. Legacy Locale Configuration**

The old Flask application used Flask-Babel.

Configured languages:

\`\`\`python
LANGUAGES = {
    'en': 'English',
    'kin': 'Kinyarwanda'
}
\`\`\`

Default locale:

\`\`\`python
BABEL\_DEFAULT\_LOCALE = 'kin'
\`\`\`

RwandaFitness V2 uses:

\`\`\`text
en
rw
\`\`\`

Therefore, during a future migration:

\`\`\`text
V1 "kin" -> V2 "rw"
V1 "en"  -> V2 "en"
\`\`\`

**---**

**# 9. Full PostgreSQL SQL Backup**

A complete SQL backup of the V1 PostgreSQL database was created.

Command used:

\`\`\`bash
pg\_dump \\
  -U muhinyuzi \\
  -h localhost \\
  -p 5432 \\
  rwandafitness\_db \\
  > \~/rwandafitness\_v1\_backup.sql
\`\`\`

PostgreSQL requested the database password interactively.

The backup was verified with:

\`\`\`bash
ls -lh \~/rwandafitness\_v1\_backup.sql
\`\`\`

Result:

\`\`\`text
/home/muhinyuzi/rwandafitness\_v1\_backup.sql
Approximate size: 15 MB
\`\`\`

Status:

\`\`\`text
✅ COMPLETE
\`\`\`

**---**

**# 10. PostgreSQL Custom Format Backup**

A second full backup was created using PostgreSQL's custom dump format.

Command used:

\`\`\`bash
pg\_dump \\
  -U muhinyuzi \\
  -h localhost \\
  -p 5432 \\
  -Fc \\
  rwandafitness\_db \\
  > \~/rwandafitness\_v1\_backup.dump
\`\`\`

The backup was verified using:

\`\`\`bash
ls -lh \~/rwandafitness\_v1\_backup.dump
\`\`\`

Result:

\`\`\`text
/home/muhinyuzi/rwandafitness\_v1\_backup.dump
Approximate size: 11 MB
\`\`\`

Status:

\`\`\`text
✅ COMPLETE
\`\`\`

The \`.dump\` format is useful because PostgreSQL \`pg\_restore\` can perform
selective restoration.

**---**

**# 11. Article-Specific Backup**

A separate backup containing only the historical article-related tables
was created.

Command used:

\`\`\`bash
pg\_dump \\
  -U muhinyuzi \\
  -h localhost \\
  -p 5432 \\
  -t articles \\
  -t articlephotos \\
  -t articlevideos \\
  rwandafitness\_db \\
  > \~/rwandafitness\_articles\_backup.sql
\`\`\`

The backup was verified using:

\`\`\`bash
ls -lh \~/rwandafitness\_articles\_backup.sql
\`\`\`

Result:

\`\`\`text
/home/muhinyuzi/rwandafitness\_articles\_backup.sql
Approximate size: 15 MB
\`\`\`

Status:

\`\`\`text
✅ COMPLETE
\`\`\`

**---**

**# 12. Database Content Verification**

The production PostgreSQL database was opened using:

\`\`\`bash
psql -U muhinyuzi -h localhost -d rwandafitness\_db
\`\`\`

The number of historical articles was checked with:

\`\`\`sql
SELECT COUNT(\*) FROM articles;
\`\`\`

Result:

\`\`\`text
11
\`\`\`

The number of article photos was checked with:

\`\`\`sql
SELECT COUNT(\*) FROM articlephotos;
\`\`\`

Result:

\`\`\`text
10
\`\`\`

The number of article videos was checked with:

\`\`\`sql
SELECT COUNT(\*) FROM articlevideos;
\`\`\`

Result:

\`\`\`text
0
\`\`\`

Therefore, at backup time:

\| Content | Count |
\|---|---:|
\| Articles | 11 |
\| Article photos | 10 |
\| Article videos | 0 |

**---**

**# 13. Local Backup Directory**

The server backups were also copied to the local development machine.

Local WSL backup directory:

\`\`\`text
\~/rwandafitness\_backup/
\`\`\`

The directory contains:

\`\`\`text
rwandafitness\_v1\_backup.dump
rwandafitness\_v1\_backup.sql
rwandafitness\_articles\_backup.sql
\`\`\`

**---**

**# 14. Copying the Full Custom Backup Locally**

The following command was executed from the local WSL environment:

\`\`\`bash
scp \\
  muhinyuzi\@209.97.143.28:/home/muhinyuzi/rwandafitness\_v1\_backup.dump \\
  \~/rwandafitness\_backup/
\`\`\`

Result:

\`\`\`text
rwandafitness\_v1\_backup.dump
Approximate size: 11 MB
\`\`\`

**---**

**# 15. Copying the Full SQL Backup Locally**

Command:

\`\`\`bash
scp \\
  muhinyuzi\@209.97.143.28:/home/muhinyuzi/rwandafitness\_v1\_backup.sql \\
  \~/rwandafitness\_backup/
\`\`\`

Result:

\`\`\`text
rwandafitness\_v1\_backup.sql
Approximate size: 15 MB
\`\`\`

**---**

**# 16. Copying the Article Backup Locally**

Command:

\`\`\`bash
scp \\
  muhinyuzi\@209.97.143.28:/home/muhinyuzi/rwandafitness\_articles\_backup.sql \\
  \~/rwandafitness\_backup/
\`\`\`

Result:

\`\`\`text
rwandafitness\_articles\_backup.sql
Approximate size: 15 MB
\`\`\`

**---**

**# 17. Verifying the Local Backups**

The local files were verified with:

\`\`\`bash
ls -lh \~/rwandafitness\_backup/
\`\`\`

Result:

\`\`\`text
total 40M

rwandafitness\_articles\_backup.sql   \~15M
rwandafitness\_v1\_backup.dump        \~11M
rwandafitness\_v1\_backup.sql         \~15M
\`\`\`

Status:

\`\`\`text
✅ Full database copied locally
✅ Custom PostgreSQL dump copied locally
✅ Article-specific backup copied locally
\`\`\`

This means the V1 backups are no longer dependent solely on the
DigitalOcean server.

**---**


---

# 18. Gyms & Coaches Specific Backup

A separate backup containing the legacy gyms, gym photos, trainers/coaches,
and trainer photos was also created.

Command used on the production server:

```bash
pg_dump \
  -U muhinyuzi \
  -h localhost \
  -p 5432 \
  -t gyms \
  -t gymphotos \
  -t trainers \
  -t trainerphotos \
  rwandafitness_db \
  > ~/rwandafitness_gyms_coaches_backup.sql
```

The backup was then copied from the DigitalOcean server to the local WSL
backup directory:

```bash
scp \
  muhinyuzi@209.97.143.28:/home/muhinyuzi/rwandafitness_gyms_coaches_backup.sql \
  ~/rwandafitness_backup/
```

The local backup directory was verified with:

```bash
ls -lh ~/rwandafitness_backup/
```

Result:

```text
rwandafitness_articles_backup.sql       ~15 MB
rwandafitness_gyms_coaches_backup.sql    86 KB
rwandafitness_v1_backup.dump            ~11 MB
rwandafitness_v1_backup.sql             ~15 MB
```

Status:

```text
✅ Gyms & coaches specific backup created
✅ Backup copied to local machine
```

This targeted dump makes it easier to inspect or migrate the legacy gym and
coach data later without restoring the entire V1 database.


**# 20. Optional Backup Integrity Check**

SHA-256 hashes can be generated with:

\`\`\`bash
sha256sum \~/rwandafitness\_backup/\*
\`\`\`

These hashes can later be used to verify that the backup files have not
changed or become corrupted.

Recommended format to preserve:

\`\`\`text
\<sha256>  rwandafitness\_v1\_backup.dump
\<sha256>  rwandafitness\_v1\_backup.sql
\<sha256>  rwandafitness\_articles\_backup.sql
\<sha256>  rwandafitness\_gyms\_coaches\_backup.sql
\`\`\`

**---**

**# 20. Important Security Notes**

Never commit the following to Git:

\`\`\`text
PostgreSQL passwords
Flask SECRET\_KEY
Django SECRET\_KEY
email passwords
API keys
SSH private keys
production credentials
.env files containing secrets
\`\`\`

The legacy file:

\`\`\`text
web/instance/flask.cfg
\`\`\`

contains production secrets and must remain private.

The backup files may also contain private application data.

Therefore, do **\*\*not\*\*** commit:

\`\`\`text
\*.sql
\*.dump
\`\`\`

to a public Git repository.

Recommended \`.gitignore\` entries:

\`\`\`gitignore
\*.sql
\*.dump
.env
.env.\*
instance/flask.cfg
\`\`\`

**---**

**# 21. Future Migration to RwandaFitness V2**

The historical articles do not need to be migrated before launching V2.

The recommended future process is:

\`\`\`text
RwandaFitness V1 PostgreSQL
            |
            v
      Legacy Article
            |
      +-----+-----+
      |           |
      v           v
 Kinyarwanda    English
      |           |
      +-----+-----+
            |
            v
     Editorial review
            |
            v
       Django Article
            |
      +-----+-----+
      |           |
      v           v
Translation    Translation
    rw             en
      |           |
      +-----+-----+
            |
            v
     RwandaFitness V2
\`\`\`

The migration mapping will approximately be:

\`\`\`text
article\_title    -> ArticleTranslation(language="rw").title
en\_title         -> ArticleTranslation(language="en").title

article\_summary  -> ArticleTranslation(language="rw").excerpt
en\_summary       -> ArticleTranslation(language="en").excerpt

article\_content  -> ArticleTranslation(language="rw").content
en\_content       -> ArticleTranslation(language="en").content
\`\`\`

The old category fields can be mapped to the new Django category choices
during migration.

**---**

**# 22. Article Migration Strategy**

There are only:

\`\`\`text
11 historical articles
\`\`\`

Therefore, there is no need to automatically publish everything immediately.

Each article can be reviewed individually.

Recommended criteria:

1\. Is the information still accurate?
2\. Is the article still useful?
3\. Does it fit the new RwandaFitness vision?
4\. Was the old URL indexed by Google?
5\. Can the content be improved?
6\. Are both language versions good enough?
7\. Is the associated image still usable?

Articles that pass the review can be migrated to V2.

**---**

**# 23. SEO Considerations**

If an old article URL has existing Google visibility, it should not simply
disappear.

Where possible:

\`\`\`text
OLD URL
   |
   | HTTP 301
   v
NEW V2 URL
\`\`\`

This helps preserve existing SEO value.

Old URLs should therefore be reviewed before permanently removing the
legacy application.

**---**

**# 24. Recovery Using the SQL Backup**

If necessary, a PostgreSQL database can be restored from the SQL backup.

Example:

\`\`\`bash
createdb -U postgres rwandafitness\_restore
\`\`\`

Then:

\`\`\`bash
psql \\
  -U postgres \\
  -d rwandafitness\_restore \\
  < rwandafitness\_v1\_backup.sql
\`\`\`

Database names and users should be adjusted depending on the recovery
environment.

**---**

**# 25. Recovery Using the Custom Dump**

The custom-format backup can be inspected using:

\`\`\`bash
pg\_restore -l rwandafitness\_v1\_backup.dump
\`\`\`

A database can then be restored using:

\`\`\`bash
createdb -U postgres rwandafitness\_restore
\`\`\`

\`\`\`bash
pg\_restore \\
  -U postgres \\
  -d rwandafitness\_restore \\
  rwandafitness\_v1\_backup.dump
\`\`\`

The custom dump should be considered the primary structured PostgreSQL
recovery archive.

**---**

**# 26. V1 Backup Summary**

Backup status:

\`\`\`text
RwandaFitness V1 PostgreSQL database
            |
            +--> Full SQL dump            ✅
            |
            +--> PostgreSQL custom dump   ✅
            |
            +--> Article-specific dump    ✅
            |
            +--> Copy on server           ✅
            |
            +--> Copy on local machine    ✅
\`\`\`

Historical content preserved:

\`\`\`text
11 articles
10 article photos
0 article videos
\`\`\`

**---**

**# 27. Deployment Decision**

The historical RwandaFitness V1 data is now backed up.

Therefore:

\`\`\`text
RwandaFitness V1
      |
      | BACKUP COMPLETE
      v
Historical data protected
      |
      v
RwandaFitness V2 deployment
\`\`\`

The 11 historical articles do **\*\*not\*\*** need to block the V2 deployment.

They can be reviewed and migrated after the V2 production environment is
stable.

**---**

**# 28. Important Rule Before Removing V1**

Do not permanently destroy the old server/database immediately after the
V2 deployment.

Recommended sequence:

\`\`\`text
1\. Backup V1                         ✅
2\. Copy backup off the server       ✅
3\. Deploy RwandaFitness V2
4\. Test production
5\. Verify authentication
6\. Verify coaches
7\. Verify gyms
8\. Verify bilingual articles
9\. Verify media
10\. Verify email flows
11\. Verify domain / HTTPS
12\. Monitor production
13\. Migrate useful V1 articles later
14\. Retire remaining V1 resources
\`\`\`

**---**

**# 29. Final Status**

**\*\*RwandaFitness V1 archival status: COMPLETE\*\***

\- [x] Legacy Flask application located
\- [x] PostgreSQL database identified
\- [x] Article models identified
\- [x] Bilingual legacy structure identified
\- [x] Full SQL database backup created
\- [x] PostgreSQL custom backup created
\- [x] Article-specific backup created
\- [x] Gyms & coaches specific backup created and copied locally
\- [x] 11 historical articles confirmed
\- [x] 10 article photos confirmed
\- [x] 0 article videos confirmed
\- [x] Backups copied to local machine
\- [x] V1 content protected
\- [ ] RwandaFitness V2 deployed
\- [ ] Production verified
\- [ ] Selected V1 articles migrated

**---**

**## Conclusion**

RwandaFitness V1 has been safely archived before the V2 deployment.

The old Flask application contains 11 historical articles, including
Kinyarwanda and English content, together with 10 associated article photos.

Multiple PostgreSQL backups were created and copied outside the production
server.

The legacy articles can therefore be migrated later without delaying the
RwandaFitness V2 launch.

**\*\*Next milestone: RwandaFitness V2 production deployment.\*\***