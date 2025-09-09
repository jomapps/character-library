# test results

## https://character.ft.tc/api/debug/character-urls?characterId=68bc1741-leo-1757411964583-643221-0bf0c1f2-944
{"success":false,"error":"Not Found","timestamp":"2025-09-09T11:23:57.096Z"}

## https://character.ft.tc/api/debug/r2-test?url=https%3A//media.rumbletv.com/68bc1741-leo-1757411964583-643221-0bf0c1f2-944
{"success":true,"data":{"url":"https://media.rumbletv.com/68bc1741-leo-1757411964583-643221-0bf0c1f2-944","accessible":false,"status":404,"statusText":"Not Found","headers":{"cf-cache-status":"DYNAMIC","cf-ray":"97c652212f1f65d0-FRA","connection":"close","content-encoding":"br","content-type":"text/plain;charset=UTF-8","date":"Tue, 09 Sep 2025 11:24:43 GMT","nel":"{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}","report-to":"{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=cRDeoop7wu8itb1DAvRd4yGBHdFiR9nDVxl7rfdQfshYg6bGk%2Brg1LsKfKFFw3912VW9RmbJN%2FeGaSjs0yU%2FFEClUUW%2FbFc4roBArs4Qbc%2FH0YtpDjCUBcANmtyCyQ%3D%3D\"}]}","server":"cloudflare","vary":"Accept-Encoding"},"timestamp":"2025-09-09T11:24:43.556Z","r2Config":{"publicUrl":"https://media.rumbletv.com","bucketName":"rumble-fanz","endpoint":"https://026089839555deec85ae1cfc77648038.r2.cloudflarestorage.com"}}}

## https://character.ft.tc/api/debug/r2-test?url=https%3A//media.rumbletv.com/12a17c20-b22d-4ebf-aa05-dea4df14be9d
{"success":true,"data":{"url":"https://media.rumbletv.com/12a17c20-b22d-4ebf-aa05-dea4df14be9d","accessible":false,"status":404,"statusText":"Not Found","headers":{"cf-cache-status":"DYNAMIC","cf-ray":"97c6552e7c1b373b-FRA","connection":"close","content-encoding":"br","content-type":"text/plain;charset=UTF-8","date":"Tue, 09 Sep 2025 11:26:48 GMT","nel":"{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}","report-to":"{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=xmEvZ4mYQv1KUX9WXXxpsROBclPK%2BtPO760tCAtdcPu%2Ft7an5IQVNl1SOrJxv3viWpbKUzvFtDTXtkGQsUPHP9SVALoupUMPlg6I5m6oTTEW3zjQIR7a8ThONJg4DA%3D%3D\"}]}","server":"cloudflare","vary":"Accept-Encoding"},"timestamp":"2025-09-09T11:26:48.315Z","r2Config":{"publicUrl":"https://media.rumbletv.com","bucketName":"rumble-fanz","endpoint":"https://026089839555deec85ae1cfc77648038.r2.cloudflarestorage.com"}}}

## root@vmd177401:~# pm2 logs character-library --lines 50
[TAILING] Tailing last 50 lines for [character-library] process (change the value with --lines option)
/root/.pm2/logs/character-library-error.log last 50 lines:
30|charact |   isOperational: true,
30|charact |   isPublic: false,
30|charact |   status: 404,
30|charact |   [cause]: null
30|charact | }
30|charact | Initial image generation API error: g: Not Found
30|charact |     at r (.next/server/chunks/8983.js:8:6220)
30|charact |     at async y (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:1717)
30|charact |     at async k (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:7627)
30|charact |     at async g (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:8630)
30|charact |     at async G (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:9752) {
30|charact |   data: null,
30|charact |   isOperational: true,
30|charact |   isPublic: false,
30|charact |   status: 404,
30|charact |   [cause]: null
30|charact | }
30|charact | Initial image generation API error: g: Not Found
30|charact |     at r (.next/server/chunks/8983.js:8:6220)
30|charact |     at async y (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:1717)
30|charact |     at async k (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:7627)
30|charact |     at async g (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:8630)
30|charact |     at async G (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:9752) {
30|charact |   data: null,
30|charact |   isOperational: true,
30|charact |   isPublic: false,
30|charact |   status: 404,
30|charact |   [cause]: null
30|charact | }
30|charact | DINOv3 upload and extract failed: Error: DINOv3 upload failed: 400 Bad Request
30|charact |     at d.uploadMedia (.next/server/chunks/9940.js:1:7185)
30|charact |     at async d.uploadAndExtract (.next/server/chunks/9940.js:1:5864)
30|charact |     at async f.processMasterReference (.next/server/chunks/9940.js:1:25666)
30|charact |     at async t.hooks.afterChange (.next/server/chunks/9940.js:1:23810)
30|charact |     at async r (.next/server/chunks/8983.js:179:17574)
30|charact |     at async w (.next/server/chunks/8983.js:236:17317)
30|charact |     at async y (.next/server/app/api/v1/characters/[id]/generate-initial-image/route.js:1:3511)
30|charact | ✗ Master reference processing failed for Leo: DINOv3 upload failed: 400 Bad Request
30|charact | Character URL debug error: g: Not Found
30|charact |     at r (.next/server/chunks/8983.js:8:6220)
30|charact |     at async x (.next/server/app/api/debug/character-urls/route.js:1:4474)
30|charact |     at async k (.next/server/app/api/debug/character-urls/route.js:1:9015)
30|charact |     at async g (.next/server/app/api/debug/character-urls/route.js:1:10018)
30|charact |     at async D (.next/server/app/api/debug/character-urls/route.js:1:11140) {
30|charact |   data: null,
30|charact |   isOperational: true,
30|charact |   isPublic: false,
30|charact |   status: 404,
30|charact |   [cause]: null
30|charact | }

/root/.pm2/logs/character-library-out.log last 50 lines:
30|charact | Testing R2 URL accessibility: https://media.rumbletv.com/68bc1741-leo-1757411964583-643221-0bf0c1f2-944
30|charact | R2 URL test result: {
30|charact |   url: 'https://media.rumbletv.com/68bc1741-leo-1757411964583-643221-0bf0c1f2-944',
30|charact |   accessible: false,
30|charact |   status: 404,
30|charact |   statusText: 'Not Found',
30|charact |   headers: {
30|charact |     'cf-cache-status': 'DYNAMIC',
30|charact |     'cf-ray': '97c652212f1f65d0-FRA',
30|charact |     connection: 'close',
30|charact |     'content-encoding': 'br',
30|charact |     'content-type': 'text/plain;charset=UTF-8',
30|charact |     date: 'Tue, 09 Sep 2025 11:24:43 GMT',
30|charact |     nel: '{"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}',
30|charact |     'report-to': '{"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=cRDeoop7wu8itb1DAvRd4yGBHdFiR9nDVxl7rfdQfshYg6bGk%2Brg1LsKfKFFw3912VW9RmbJN%2FeGaSjs0yU%2FFEClUUW%2FbFc4roBArs4Qbc%2FH0YtpDjCUBcANmtyCyQ%3D%3D"}]}',
30|charact |     server: 'cloudflare',
30|charact |     vary: 'Accept-Encoding'
30|charact |   },
30|charact |   timestamp: '2025-09-09T11:24:43.556Z',
30|charact |   r2Config: {
30|charact |     publicUrl: 'https://media.rumbletv.com',
30|charact |     bucketName: 'rumble-fanz',
30|charact |     endpoint: 'https://026089839555deec85ae1cfc77648038.r2.cloudflarestorage.com'
30|charact |   }
30|charact | }
30|charact | Testing R2 URL accessibility: https://media.rumbletv.com/12a17c20-b22d-4ebf-aa05-dea4df14be9d
30|charact | R2 URL test result: {
30|charact |   url: 'https://media.rumbletv.com/12a17c20-b22d-4ebf-aa05-dea4df14be9d',
30|charact |   accessible: false,
30|charact |   status: 404,
30|charact |   statusText: 'Not Found',
30|charact |   headers: {
30|charact |     'cf-cache-status': 'DYNAMIC',
30|charact |     'cf-ray': '97c6552e7c1b373b-FRA',
30|charact |     connection: 'close',
30|charact |     'content-encoding': 'br',
30|charact |     'content-type': 'text/plain;charset=UTF-8',
30|charact |     date: 'Tue, 09 Sep 2025 11:26:48 GMT',
30|charact |     nel: '{"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}',
30|charact |     'report-to': '{"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=xmEvZ4mYQv1KUX9WXXxpsROBclPK%2BtPO760tCAtdcPu%2Ft7an5IQVNl1SOrJxv3viWpbKUzvFtDTXtkGQsUPHP9SVALoupUMPlg6I5m6oTTEW3zjQIR7a8ThONJg4DA%3D%3D"}]}',
30|charact |     server: 'cloudflare',
30|charact |     vary: 'Accept-Encoding'
30|charact |   },
30|charact |   timestamp: '2025-09-09T11:26:48.315Z',
30|charact |   r2Config: {
30|charact |     publicUrl: 'https://media.rumbletv.com',
30|charact |     bucketName: 'rumble-fanz',
30|charact |     endpoint: 'https://026089839555deec85ae1cfc77648038.r2.cloudflarestorage.com'
30|charact |   }
30|charact | }

## curl -X POST https://character.ft.tc/api/v1/characters/generate-initial-image \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Test character for debugging URL issue"}'
	 
	 {"success":true,"message":"Initial character image generated successfully","data":{"imageId":"68c00f8cfce8ff8dc0862779","dinoAssetId":"a0e2d676-1496-4049-aba9-4db08a7423c4","publicUrl":"https://media.rumbletv.com/a0e2d676-1496-4049-aba9-4db08a7423c4","filename":"standalone_initial_1757417356278.jpg"}}root@vmd177401:~#