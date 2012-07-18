assertEquals('', String.raw ``);
assertEquals('\n', String.raw `
`);
assertEquals('\\n', String.raw `\n`);
assertEquals('\\n42\\t', String.raw `\n${ 40 + 2 }\t`);
assertEquals('\n42\t', String.raw `
${42}	`);
assertEquals('\\\n42\\\n', String.raw `\
${42}\
`);
