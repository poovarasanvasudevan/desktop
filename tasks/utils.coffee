args = require './args'
async = require 'async'
spawn = require 'cross-spawn-async'
fs = require 'fs'
require 'colors'

updateManifest = (jsonPath, updateFn, done) ->
  async.waterfall [
    async.apply fs.readFile, jsonPath, 'utf8'
    (file, callback) ->
      json = JSON.parse file
      updateFn json
      text = JSON.stringify json
      fs.writeFile jsonPath, text, 'utf8', callback
  ], done

applyPromise = (fn, args...) ->
  (cb) ->
    fn args...
      .then (results...) -> cb null, results...
      .catch cb

applySpawn = (cmd, params, opts = {}) ->
  (cb) ->
    unless opts.stdio
      opts.stdio = if args.verbose then 'inherit' else 'ignore'
    if args.verbose
      console.log 'spawning', cmd
    child = spawn cmd, params, opts
    if cb
      errored = false
      child.on 'error', (err) ->
        errored = true
        cb(err)
      child.on 'close', (code) ->
        unless errored
          if code
            err = new Error "`#{cmd} #{params.join(' ')}` exited with code #{code}"
            err.code = code
            cb err
          else
            cb null

applyIf = (cond, fn) ->
  if cond
    fn
  else
    (cb) -> cb(null)

platform = () ->
  if process.platform == 'win32'
    process.platform
  else
    arch = if process.arch == 'ia32' then '32' else '64'
    process.platform + arch

platformOnly = () ->
  if process.platform == 'win32'
    'win'
  else
    process.platform

join = (args) ->
  (val for own key, val of args).join ' '

log = (callback, messages...) ->
  (err) ->
    if args.verbose
      status = if err then 'Failed'.red else 'Successful'.green
      console.log status, join(messages)
    callback err

module.exports =
  updateManifest: updateManifest
  applyPromise: applyPromise
  applySpawn: applySpawn
  applyIf: applyIf
  platform: platform
  platformOnly: platformOnly
  join: join
  log: log
