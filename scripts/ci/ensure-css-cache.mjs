import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const target = resolve(
  process.cwd(),
  "node_modules/react-native-css-interop/.cache/web.css",
);

mkdirSync(dirname(target), { recursive: true });
if (!existsSync(target)) {
  writeFileSync(target, "/* placeholder gerado no CI */\n");
  console.log("Criado:", target);
} else {
  console.log("Já existe:", target);
}
