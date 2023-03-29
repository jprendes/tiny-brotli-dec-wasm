if (typeof Deno === "undefined") {
    const fs = await import("fs/promises");
    globalThis.Deno = {
        readFile: fs.readFile,
        stdout: process.stdout,
        stderr: process.stderr,
        args: process.argv.slice(2),
    };
}

export default Deno;