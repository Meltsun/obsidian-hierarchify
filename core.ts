//命令和其他交互接口的回调函数
import {MarkdownView} from "obsidian";
import {MarkdownRefactoringHandle,HeadingDepth} from "MarkdownRefactoringHandle"
export type { HeadingDepth };

//设置项
export interface MySetting{
    testSetting1:string;
    listIndexHandleMethod:string;
    addHeadingIndexFrom:HeadingDepth|7;
}

//将一个笔记的序号格式化
export function format_index_for_a_note(markdownView:MarkdownView,settings:MySetting){
    const editor = markdownView.editor;
    const cursor = editor.getCursor();
    let text = editor.getValue();
    const handle=new MarkdownRefactoringHandle(text)
    text = handle
            .format_index({
                addHeadingIndexFrom:settings.addHeadingIndexFrom,
                listIndexHandleMethod:settings.listIndexHandleMethod
            })
            .stringify()
    //format_index(lines,{addTitleIndexFrom:settings.titleIndex, listIndexHandleMethod:settings.listIndex});
    editor.setValue(text);
    editor.setCursor(cursor);
    console.log("reflactor:已修改")
}



