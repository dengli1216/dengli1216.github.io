# Tests

先替换黄金集的占位枚举、样本和评审状态，再实现 `run_eval.template.py` 中的 TODO。每条断言只比较 `decision`、`status`、`critical_gap`、`manual_review`、`citation`；其他质量判断应另行显式定义。

关键 Gate 要在完整评测中按案例风险设定重复次数，比较稳定的结构化字段，而非自由文本。失败用例重跑必须保留首轮与重跑记录，不得覆盖原结果。
