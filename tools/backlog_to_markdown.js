// BacklogのWiki, 課題をBacklog記法からMarkdownに変更する
const API_KEY= 'irDm9kZO9XLliePM8GRFSx8ouc9ZHW4wZ4ftHPI7OZmZlD6hjCj0HNkSW9lcG9Fs'
const API_BASE_URI='https://toranoana.backlog.jp/api/v2/'
const PROJECTS_URI='projects/'
const WIKIS_URI='wikis'
const ISSUES_URI='issues'
const axios = require('axios')
const log4js = require('log4js')
const url = require('url')
const { setTimeout } = require('timers/promises')

log4js.configure({
  appenders: {
    dev: { type: "file", filename: "dev_output.log" },
    prod: { type: "file", filename: "backlog_wiki_convert_output.log" }
  },
  categories: {
    prod: { appenders: ["prod"], level: "info" },
    default: { appenders: ["dev"], level: "debug" }
  }
});

if (process.argv.length < 3) {
  logger.warn('コマンドライン引数でプロジェクトIDを指定してください')
  return
}

var logger
if (process.argv.length >= 4) {
  logger = log4js.getLogger(process.argv[3]);
  logger.debug(process.argv[3])
}
else {
  logger = log4js.getLogger('dev')
}
logger.debug(process.argv.length)
logger.info("input log4js. level: " + logger.level)

main(process.argv[2])

/**
 * メイン関数
 * 
 */
async function main(projectIdOrKey) {
  logger.info("---------------- start convert ----------------")
  
  if(!await isValidProject(projectIdOrKey)) {
    logger.error('プロジェクトが存在していません')
    return
  }

  // wikiの更新
  var wikis = await getWikis(projectIdOrKey)
  await updateWikisToMarkdown(wikis)

  /* この行をコメントアウトすると課題更新も有効になります
  var issues = await getIssues(projectIdOrKey)
  await updateIssuesToMarkdown(issues)
  // */

  logger.info("---------------- end convert ----------------")
  log4js.shutdown((err) => {
    if (err) throw err
    process.exit(0)
  })
}

/**
 * Backlogプロジェクトがあるか確認
 * 
 */
async function isValidProject(projectIdOrKey) {
  logger.debug("isValidProject")
  var requestUrl = API_BASE_URI + PROJECTS_URI + projectIdOrKey
  logger.info("requestUrl: " + requestUrl)
  const res = await axios.get(requestUrl, {
    params: {
      apiKey: API_KEY
    }
  })
  .catch(err => {
    if (err.response) {
      logger.error("errorStatus: " + err.response.status)
    }
    logger.error(err.message)
    return false
  })
  return true
}

/**
 * Wiki一覧を取得
 * 
 */
async function getWikis(projectIdOrKey) {
  logger.info("getWikis")
  var requestUrl = API_BASE_URI + WIKIS_URI
  logger.info("requestUrl: " + requestUrl)
  const res = await axios.get(requestUrl, {
    params: {
      apiKey: API_KEY,
      projectIdOrKey: projectIdOrKey
    }
  })
  .catch(err => {
    if (err.response) {
      logger.error("errorStatus: " + err.response.status)
    }
    logger.error(err.message)
    return []
  })
  logger.info("get wikis: " + res.data.length)
  return res.data
}

/**
 * 指定したWikiを取得
 * 
 */
async function getWiki(wikiId) {
  logger.info("getWiki")
  var requestUrl = API_BASE_URI + WIKIS_URI + '/' + wikiId
  logger.info("requestUrl: " + requestUrl)
  const res = await axios.get(requestUrl, {
    params: {
      apiKey: API_KEY
    }
  })
  .catch(err => {
    if (err.response) {
      logger.error("errorStatus: " + err.response.status)
    }
    logger.error(err.message)
    return null
  })
  return res.data
}

/**
 * WikiをMarkdownに更新する
 * 
 */
async function updateWikisToMarkdown(wikis) {
  logger.info('updateWikis')

  var errorIdList = []
  for(var wiki of wikis) {
    await setTimeout(1000)
    logger.debug(wiki.id)
    const res = await getWiki(wiki.id)
    if (!res) {
      logger.error('not found wiki: ' + wiki.id)
      continue
    }
    logger.debug(res.content)
    const newContent = convertToMarkdown(res.content)
    logger.debug(newContent)
    var requestUrl = API_BASE_URI + WIKIS_URI + '/' + wiki.id
    const params = new url.URLSearchParams({
      name: res.name,
      content: newContent,
      mailNotify: false
    })
    logger.info("requestUrl: " + requestUrl)
    const updateRes = await axios.patch(requestUrl, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      params: {
        apiKey: API_KEY
      }
    })
    .catch(err => {
      logger.debug(err)
      errorIdList.push(wiki.id)
      if (err.response) {
        logger.error("errorStatus: " + err.response.status)
      }
      logger.error("error update wiki. wiki ID: " + wiki.id + ", message: " + err.message)
    })
  }
  if (errorIdList.length !== 0) {
    logger.error(errorIdList.join(','))
  }

}


/**
 * 課題一覧を取得
 * 
 * 
 */
async function getIssues(projectIdOrKey) {
  logger.debug("getIssues")
  var requestUrl = API_BASE_URI + ISSUES_URI
  logger.debug("requestUrl: " + requestUrl)
  const res = await axios.get(requestUrl, {
    params: {
      apiKey: API_KEY,
      projectId: [projectIdOrKey]
    }
  })
  .catch(err => {
    if (err.response) {
      logger.error("errorStatus: " + err.response.status)
    }
    logger.error(err.message)
    return false
  })
  logger.debug(res.data.length)
  return res.data
}

/**
 * 指定した課題を取得
 */
async function getIssue(issueIdOrKey) {
  logger.debug("getIssue")
  var requestUrl = API_BASE_URI + ISSUES_URI + "/" + issueIdOrKey
  logger.debug("requestUrl: " + requestUrl)
  const res = await axios.get(requestUrl, {
    params: {
      apiKey: API_KEY
    }
  })
  .catch(err => {
    if (err.response) {
      logger.error("errorStatus: " + err.response.status)
    }
    logger.error(err.message)
    return false
  })
  logger.debug(res.data.length)
  return res.data
}

/**
 * 課題をMarkdownに更新する
 * 
 */
async function updateIssuesToMarkdown(issues) {
  logger.debug('updateIssues')
  // for(var issue of issues) {
    var issue = issues[0]
    logger.debug(issue.id)
    const res = await getIssue(issue.id)
    logger.debug(res)
    const newDescription = convertToMarkdown(res.description)
    logger.debug(newDescription)
  // }

}

/**
 * 中身のテキストをMarkdownに変換する
 * 
 */
function convertToMarkdown(e) {
  logger.debug(e)
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
