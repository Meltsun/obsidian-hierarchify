import {MarkdownView,Notice,TFile,TFolder,Vault} from "obsidian";
import {MarkdownRefactoringHandle,HeadingDepth,is_valid_windows_fileName} from "MarkdownRefactoringHandle"
export type { HeadingDepth };

//设置项
export interface MySettings{
    testSetting1:string;
    listIndexHandleMethod:string;
    addHeadingIndexFrom:HeadingDepth|7;
}

const MY_DEFAULT_SETTING: MySettings = {
    testSetting1: 'test default setting',
    listIndexHandleMethod:'Increase from 1' as 'Increase from 1'|'Increase from Any',
    addHeadingIndexFrom:1
}

export class CoreHandle{
    private settings:MySettings

    constructor(private vault:Vault){}

    public set_settings(newSettings:Partial<MySettings>){
        this.settings=Object.assign({},MY_DEFAULT_SETTING,this.settings,newSettings)
    }

    public get_settings(){
        return this.settings
    }

    //将一个笔记的序号格式化
    public format_index_for_a_note(markdownView:MarkdownView){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        //format_index(lines,{addTitleIndexFrom:settings.titleIndex, listIndexHandleMethod:settings.listIndex});
        editor.setValue(text);
        editor.setCursor(cursor);
        new Notice("reflactor:序号格式化")
    }

    public heading_to_list(markdownView:MarkdownView,line:number,modifyPeerHeadings:boolean){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .heading_to_list_by_line(line+1,modifyPeerHeadings)
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        editor.setValue(text);
        editor.setCursor(cursor);
        new Notice("reflactor:标题转列表")
    }

    public list_to_heading(markdownView:MarkdownView,line:number){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .list_to_heading_by_line(line+1)
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        editor.setValue(text);
        editor.setCursor(cursor);
        new Notice("reflactor:列表转标题")
    }

    public heading_to_heading(markdownView:MarkdownView,line:number,newDepth:HeadingDepth,modifyPeerHeadings:boolean){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .heading_to_heading_by_line(line+1,newDepth,modifyPeerHeadings)
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        editor.setValue(text);
        editor.setCursor(cursor);
        new Notice("reflactor:列表转标题")
    }

    public async heading_to_note(markdownView:MarkdownView,line:number,modifyPeerHeadings:boolean){
        console.log("标题转笔记");
        const editor = markdownView.editor;
        const handle=new MarkdownRefactoringHandle(editor.getValue());
        if(modifyPeerHeadings){
            const notes=handle.get_contents_of_peer_heading_by_line(line+1);
            const folderPath=markdownView.file.path.slice(0,-3);
            if(!(this.vault.getAbstractFileByPath(folderPath) instanceof TFolder)){
                await this.vault.createFolder(folderPath)
            }
            let isAllFileNameLegal=true;
            for(const noteInfo of notes){
                if(is_valid_windows_fileName(noteInfo.headingText)){
                    const notePath=folderPath+'/'+noteInfo.headingText+".md";
                    const abFile = this.vault.getAbstractFileByPath(notePath);
                    const file=abFile instanceof TFile?abFile as TFile:await this.vault.create(notePath, "");
                    await this.vault.append(file,noteInfo.content)
                }
                else{
                    isAllFileNameLegal=false;
                    let notePath;
                    let illegalIndex=-1;
                    do{
                        illegalIndex++;
                        notePath = folderPath+'/'+"原标题不合法_"+illegalIndex+'.md'
                    }while(this.vault.getAbstractFileByPath(notePath) instanceof TFile)
                    await this.vault.create(notePath,"原标题:"+noteInfo.headingText+'\n---\n'+noteInfo.content);
                }
            }
            if(isAllFileNameLegal){
                new Notice("部分标题无法作为合法的文件名。请手动更改标题")
            }
        }
        else{
            const noteInfo=handle.get_content_of_a_heading_by_line(line+1);
            const folderPath=markdownView.file.parent?.path
            if(folderPath===undefined){
                return;
            }
            if(is_valid_windows_fileName(noteInfo.headingText)){
                const notePath=folderPath+'/'+noteInfo.headingText+".md";
                const abFile = this.vault.getAbstractFileByPath(folderPath);
                const file=abFile instanceof TFile?abFile as TFile:await this.vault.create(notePath, "");
                await this.vault.append(file,noteInfo.content)
            }
            else{
                new Notice("标题无法作为合法的文件名。请先手动更改标题")
            }
        }
    }

    public folder_to_note(){
        //TODO:
    }

    public add_links_based_on_file_tree(){
        //TODO:
    }

}