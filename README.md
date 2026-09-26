# Learning Dashboard

Glenn 的公开学习进度 Dashboard。

- GitHub 风格学习热力图
- 每日 / 每周学习时长
- 当前与历史最长连续学习天数
- 各学习主线进度
- 最近学习记录

完整学习资料保存在私有仓库 `learning-os`；本仓库只保存公开展示所需的非敏感统计数据。

## 数据

网页读取 `data/progress.json`。学习记录格式：

```json
{"date":"2026-09-26","track":"英语","topic":"口语与单词","minutes":30}
```

主线进度不是按学习时长自动推算，而是按学习计划实际完成度维护。
