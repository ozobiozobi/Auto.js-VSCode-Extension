//
// 注意：这个示例测试正在使用 Mocha 测试框架。
// 请访问 https://mochajs.org/ 来获取帮助信息。
//

// 'assert' 模块提供了来自 node 的断言方法
import * as assert from 'assert';

// 定义一个 Mocha 测试套件，将相似类型的测试组织在一起
suite("Extension Tests", () => {

    // 定义一个 Mocha 单元测试
    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });

    // 如果您要在未来的测试中使用 `vscode` 和 `myExtension`，
    // 请在此处添加相关的测试用例

    // 例如：
    // test("Something 2", () => {
    //     assert.strictEqual(vscode.window.activeTextEditor, undefined);
    //     myExtension.activate();
    //     // 添加更多的断言...
    // });
});
