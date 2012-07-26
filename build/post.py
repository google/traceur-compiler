import httplib, urllib, fileinput

if __name__ == "__main__":
  params = urllib.urlencode([
    ('js_code', ''.join([ line for line in fileinput.input() ])),
    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
    ('output_format', 'text'),
    ('language', 'ECMASCRIPT5'),
    ('output_info', 'compiled_code'),
  ])
  headers = { "Content-type": "application/x-www-form-urlencoded" }
  conn = httplib.HTTPConnection('closure-compiler.appspot.com')
  conn.request('POST', '/compile', params, headers)
  response = conn.getresponse()
  data = response.read()
  print data
  conn.close()
