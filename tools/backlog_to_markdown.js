// BacklogのWiki, 課題をBacklog記法からMarkdownに変更する
const API_KEY= 'irDm9kZO9XLliePM8GRFSx8ouc9ZHW4wZ4ftHPI7OZmZlD6hjCj0HNkSW9lcG9Fs'
const API_BASE_URI='https://toranoana.backlog.jp/api/v2/'
const PROJECTS_URI='projects/'
const WIKIS_URI='wikis/'
const ISSUES_URI='issues/'
const axios = require('axios')

function main(projectIdOrKey) {
  if(!isValidProject) {
    console.error('プロジェクトが存在していません')
    return
  }

  var wikis = getWikis(projectIdOrKey)
  updateWikisToMarkdown(wikis)
  var issues = getIssues(projectIdOrKey)
  updateIssuesToMarkdown(issues)

}

// Backlogプロジェクトがあるか確認
function isValidProject(projectIdOrKey) {
  axios.get(API_BASE_URI + PROJECTS_URI + projectIdOrKey, {
    params: {
      apiKey: API_KEY
    }
  })
  .then(res => {
    console.debug(res.data.length)
    console.debug(res.data)
    return !!res.data.length
  })
  .catch(() => {return false})

}
// Wiki一覧を取得
function getWikis(projectIdOrKey) {
  axios.get(API_BASE_URI + WIKIS_URI, {
    params: {
      apiKey: API_KEY,
      projectId: [projectIdOrKey]
    }
  })
  .then(res => {
    console.debug(res.data.length)
    console.debug(res.data)
    return res.data
  })
  .catch(() => {
    return []
  })

}

// WikiをMarkdownに更新する
function updateWikisToMarkdown(wikis) {
  console.log('update')

  for(var wiki of wikis) {

  }

}


// 課題一覧を取得
function getIssues(projectIdOrKey) {
  axios.get(API_BASE_URI + ISSUES_URI, {
    params: {
      apiKey: API_KEY,
      projectId: [projectIdOrKey]
    }
  })
  .then(res => {
    console.debug(res.data.length)
    console.debug(res.data)
    return res.data
  })
  .catch(() => {
    return []
  })

}

// 課題をMarkdownに更新する
function updateIssuesToMarkdown(issues) {
  console.log('update')
  for(var issue of issues) {
    
  }

}

// 変換用関数
function convertToMarkdown(e) {
  console.log(e)
  return
  const t = [],
    n = [],
    r = [],
    a = (e) => {
      return (
        [
          {
            pattern: /<(.*?)>/g,
            replacement: (e, t) => `&lt;${t}&gt;`,
          },
          {
            pattern: /</g,
            replacement: (e, t) => "&lt;",
          },
          {
            pattern: /''(.*?)''/g,
            replacement: (e, t) => ` **${t.trim()}** `,
          },
          {
            pattern: /'(.*?)'/g,
            replacement: (e, t) => ` *${t.trim()}* `,
          },
          {
            pattern: /%%(.*?)%%/g,
            replacement: (e, t) => ` ~~${t.trim()}~~ `,
          },
          {
            pattern: /\[\[(.*?)[:>](.*?)\]\]/g,
            replacement: (e, t, n) => `[${t.trim()}](${n})`,
          },
          {
            pattern: /&color\((.*?)\)(\s+)?{(.*?)}/gi,
            replacement: (e, t, n, r) =>
              `<span style="color: ${t};">${r}</span>`,
          },
          {
            pattern: /#image\((.*?)\)/,
            replacement: (e, t) => `![${t}]`,
          },
          {
            pattern: /#thumbnail\((.*?)\)/,
            replacement: (e, t) => `![${t}]`,
          },
          {
            pattern: /#attach\((.*?):(.*?)\)/,
            replacement: (e, t, n) => `[${t}][${n}]`,
          },
          {
            pattern: /  /,
            replacement: " ",
          },
          {
            pattern: /&/,
            replacement: "&amp;",
          },
        ].forEach(({ pattern: t, replacement: n }) => {
          e = e.replace(t, n);
        }),
        e
      );
    },
    p = [
      {
        pattern: /\n\r/g,
        replacement: "\n",
      },
      {
        pattern: /\r/g,
        replacement: "\n",
      },
      {
        pattern: /^(\*+)(.*)$/gm,
        replacement: (e, t, n) => `\n${t.replace(/\*/g, "#")} ${a(n.trim())}\n`,
      },
      {
        pattern: /\n\|([\s|\S]*)\|\n(?!\|)/g,
        replacement: (e, t) => {
          if (-1 === t.indexOf("|h\n")) {
            let e = 0,
              n = t.split("\n")[0].split("|").length,
              r = "";
            for (; e < n; e++) r += "|:--";
            return `\n${(r += "|")}\n|${t}|\n`;
          }
          return `\n|${t}|\n`;
        },
      },
      {
        pattern: /^\|(.*)\|(\s?)$/gm,
        replacement: (e, t, n) =>
          `|${(t = (t = (t = (t = (t = (t = t.replace(/\|~/g, "|")).replace(
            /^~/g,
            ""
          )).replace(/\|\|/g, "| |")).replace(/^\|/g, " |")).replace(
            /^\|/g,
            " |"
          )).replace(/\|$/g, "| "))}|${n}`,
      },
      {
        pattern: /^\|(.*)\|h\s?$/gm,
        replacement: (e, t) => {
          let n = "",
            r = t.split("|"),
            a = 0,
            p = r.length;
          for (; a < p; a++) n += "|:--";
          return (
            (n += "|"),
            `\n|${(t = (t = (t = (t = (t = t.replace(/\|~/g, "|")).replace(
              /^~/g,
              ""
            )).replace(/\|\|/g, "| |")).replace(/^\|/g, " |")).replace(
              /\|$/g,
              "| "
            ))}|\n${n}`
          );
        },
      },
      {
        pattern: /\n\|([\s|\S]*?)\|\n([^|])/g,
        replacement: (e, t, n) => `\n|${a(t)}|\n\n${n}`,
      },
      {
        pattern: /\n\|([\s|\S]*?)\|\n(?!\|)/g,
        replacement: (e, t) => `\n\n|${t}|\n\n`,
      },
      {
        pattern: /\n\+([\s|\S]*?)\n\n/g,
        replacement: (e, t) => `\n+${t}\n\n\n`,
      },
      {
        pattern: /\n\+([\s|\S]*?)\n\n/g,
        replacement: (e, t) => {
          let n = "";
          {
            const e = [];
            let r = 0;
            (t = (t = (t = "\n+" + t.trim()).replace(
              /^(\++)(.*)$/gm,
              (e, t, n) => `${t} ${n.trim()}`
            )).trim())
              .split("\n")
              .forEach((t) => {
                const p = t.split(" ")[0].length;
                p < r && (e[r] = 0),
                  (e[(r = p)] = e[r] ? e[r] + 1 : 1),
                  (n += a(t.replace("+ ", e[r] + ". ")) + "\n");
              });
          }
          return `\n${(t = n.replace(/^(\++)(.*)/gm, (e, t, n) => {
            const r = t.length;
            let a = 0,
              p = "";
            for (; a < r; a++) p += "    ";
            return p + n;
          }))}\n`;
        },
      },
      {
        pattern: /^(-+)(.*)$/gm,
        replacement: (e, t, n) => {
          let r = 0,
            p = t.length - 1,
            l = "";
          if (!n) return t;
          for (; r < p; r++) l += "    ";
          return (l += "-"), (n = a(n).trim()), `${l} ${n}`;
        },
      },
      {
        pattern: /&br;/g,
        replacement: " <br>",
      },
    ];
  (e = (e = (e = (e = (e = (e = "\n" + e + "\n\n").replace(
    /^#contents$/gm,
    "[toc]\n"
  )).replace(
    /\n{code}([\s|\S]*?){\/code}\n/g,
    (e, n) => (
      t.push(n), `\n{{CODE_REPACE_BACKLOG_TO_MARKDOWN-${t.length - 1}}}\n`
    )
  )).replace(
    /\n{quote}([\s|\S]*?){\/quote}\n/g,
    (e, t) => (
      n.push(t), `\n{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN-${n.length - 1}}}\n`
    )
  )).replace(
    /^.*$/gm,
    (() => {
      const e = /^(?![*\|\-\+\s>)`])(.*)$/;
      return (t) =>
        t &&
        e.test(t) &&
        !t.startsWith("{{CODE_REPACE_BACKLOG_TO_MARKDOWN") &&
        !t.startsWith("{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN")
          ? (r.push(t),
            `{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-${r.length - 1}}}`)
          : t;
    })()
  )).replace(
    /\n{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-.*?}}\n(?!{{)/g,
    (e) => `${e}\n`
  )),
    p.forEach(({ pattern: t, replacement: n }) => {
      e = e.replace(t, n);
    });
  for (; /\n\n\n/g.test(e); ) e = e.replace("\n\n\n", "\n\n");
  return (e = (e = (e = e.replace(
    /{{CODE_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g,
    (e, n) =>
      t[Number(n)].trim()
        ? "\n```\n" + t[Number(n)].trim() + "\n```\n"
        : "\n```\n```\n"
  )).replace(/{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g, (e, t) => {
    let r = n[Number(t)].trim();
    return "\n> " + (r = r.split("\n").join("\n> ")) + "\n";
  })).replace(/{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g, (e, t) => {
    let n = r[Number(t)].trim();
    return (n = a(n));
  })).trim();
}

if (process.argv.length < 3) {
  console.warn('コマンドライン引数でプロジェクトIDを指定してください')
  return
}

main(process.argv[2])