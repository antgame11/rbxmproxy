local process = require("@lune/process")
local fs = require("@lune/fs")
local roblox = require("@lune/roblox")

local old, new = process.args[1], process.args[2]
local xml = fs.readFile(old)
local model = roblox.deserializeModel(xml)
local bin = roblox.serializeModel(model)
fs.writeFile(new, bin)