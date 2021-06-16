const fs = require("fs");
const fileServer = {
  // 写文件
  write(path, text) {
    fs.writeFileSync(path, text);
  },
  // 读文件
  read(path) {
    return fs.readFileSync(path);
  }
};

const { fileServer } = require("./tools");
const path = require("path");
const task = () => {
  // 获取资讯任务
  const getMsgTask = Promise.all(tasks());
  getMsgTask.then(res => {
    // 读取json
    const { data } = JSON.parse(
      fileServer.read(path.join(resourcePath, "./index.json")).toString()
    );
    // ... 此处省略对资讯 格式化内容
    const text = msgHandle(res);
    // 写入资讯
    fileServer.write(
      path.join(resourcePath, "./index.json"),
      JSON.stringify({
        data: [
          {
            date: now,
            text
          },
          ...data
        ]
      })
    );
  });
};

const puppeteer = require("puppeteer");

const task = async () => {
  // 打开chrome浏览器
  const browser = await puppeteer.launch({
    headless: false
  });
  // 新建页面
  const page = await browser.newPage();
  // 跳转到掘金
  await page.goto("https://juejin.im");
  // 菜单导航选择器
  const navSelector = ".view-nav .nav-item";
  // 文章列表选择器
  const listSelector = ".entry-list .item a.title";
  // 菜单类别
  const navType = "前端";
  await page.waitFor(navSelector);
  // 导航列表
  const navList = await page.$$eval(navSelector, ele =>
    ele.map(el => el.innerText)
  );
  // 前端导航索引
  const webNavIndex = navList.findIndex(item => item === navType);
  await Promise.all([
    page.waitForNavigation(),
    page.click(`${navSelector}:nth-child(${webNavIndex + 1})`)
  ]);
  // 等待文章列表选择器加载完成
  await page.waitForSelector(listSelector, {
    timeout: 5000
  });
  // 通过选择器找到对应列表项的标题和链接
  const res = await page.$$eval(listSelector, ele =>
    ele.map(el => ({
      url: el.href,
      text: el.innerText
    }))
  );
  // [ { url: 'https://juejin.im/post/5dd55512f265da47a807cc06',
  //   text: 'if 我是前端Leader，怎么走出小微前端团队的围墙?' },
  // { url: 'https://juejin.im/post/5dd49a45e51d45400206a655',
  //   text: 'Koa还是那个Koa，但是Nodejs已经不再是那个Nodejs' },
  // { url: 'https://juejin.im/post/5dd4b991e51d450818244c30',
  //   text: 'WebSocket 原理浅析与实现简单聊天' },...
};
task();
