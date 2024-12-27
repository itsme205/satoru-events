const path = require("path");
const fs = require('fs');
const ignore = require("./post-build.ignore.json");

console.log("Running post-build script, wait...")

async function scan_dir(dir = path.join(__dirname, "src")) {
    if (!fs.readdirSync(dir)) return []
    let dir_files = await fs.promises.readdir(dir)

    await new Promise((resolve) => {
        async function check_dir() {
            if (!dir_files.find(val => val.split('.').length === 1)) { resolve(true); return }
            const dir_name = dir_files.find(val => val.split('.').length === 1) || ''
            dir_files = [
                ...dir_files.filter(val => val !== dir_name),
                ...(
                    (await fs.promises.readdir(path.join(dir, dir_name))).map((val) => path.join(dir_name, val))
                )
            ]

            check_dir()
        }
        check_dir()
    })

    return dir_files
}
async function create_path(file_path) {
    const divided_path = file_path.split("\\")

    for (let i in divided_path) {
        if (ignore.includes(divided_path[i])) { console.log(`Ignoring file: ${divided_path[i]}`); continue }
        const file_path = path.join(divided_path.slice(0, parseInt(i) + 1).join("/"))
        if (fs.existsSync(path.join("dist", file_path))) continue

        const stat = await fs.promises.stat(path.join("src", file_path))
        if (stat.isFile()) {
            const file_data = await fs.promises.readFile(path.join("src", file_path))
            await fs.promises.writeFile(path.join("dist", file_path), file_data)

            console.log(`Copied file into ${path.join("dist", file_path)}`)
        } else if (!fs.existsSync(path.join("dist", file_path))) {
            await fs.promises.mkdir(path.join("dist", file_path))
        }

    }
}


async function run() {
    console.log("Post-build script has launched.")
    const files = await scan_dir()

    for (let i in files) {
        const divided_path = files[i].split("\\")
        const extension = divided_path.at(-1).split(".").at(-1)
        if (extension === "ts") continue
        if (fs.existsSync(path.join("dist", files[i]))) continue

        await create_path(files[i])
    }

    console.log("File copying has finished.")
}
run()