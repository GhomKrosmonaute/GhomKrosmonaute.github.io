import fs from "fs"

const file = fs.readFileSync("src/game-metadata.ts", "utf8")

const version = file.match(/version: "(.*)"/)[1]

const split = version.split(".")

const newVersion = `${split[0]}.${split[1]}.${parseInt(split[2]) + 1}`

console.log("new version", newVersion)

const newFile = file.replace(version, newVersion)

fs.writeFileSync("src/game-metadata.ts", newFile)
