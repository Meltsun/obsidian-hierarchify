//添加交互接口，调用core
import { Plugin, MarkdownView,App,PluginSettingTab,Setting,Menu} from "obsidian";
//import { MarkdownIndex } from "./indexFormatter_old";
import {CoreHandle,MySettings,HeadingDepth} from "./core";

export default class myPlugin extends Plugin {
    handle:CoreHandle

    //加载设置和缺省项
    async load_settings() {
        this.handle.set_settings(await this.loadData());
    }

    //保存设置和缺省项
    private async save_settings() {
        await this.saveData(this.handle.get_settings);
    }
    
    public async set_settings(settings:Partial<MySettings>){
        this.handle.set_settings(settings);
        await this.save_settings();
    }

    public get_settings(){
        return this.handle.get_settings()
    }

    //启动时加载
    async onload() {
        this.handle=new CoreHandle();
        await this.load_settings();
        //设置里，添加标签页
        this.addSettingTab(new MySettingTab(this.app, this,this.handle));

        //最左侧那一条菜单，添加图标
        this.addRibbonIcon('dice', 'Format this note', (evt: MouseEvent) => {
            const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
            if(markdownView){
                this.handle.format_index_for_a_note(markdownView);
            }
        });

        //添加命令
        this.addCommand({
            id: "obsidian-index-formatting-format_this_note",
            name: "Format this note",
            checkCallback: (checking: boolean) => {
                const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!markdownView) {
                    return false;
                }
                else{
                    if (!checking) {
                        this.handle.format_index_for_a_note(markdownView);
                    }
                    return true;
                }
            },
        });

        //编辑栏右键菜单
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor, view) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line)
                const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
                if(line==null || !/^#+ .*/.test(line) || !markdownView){
                    return;
                }
                console.log("在标题点击右键菜单：%d",cursor.line)
                const match = line.match(/^#+/)
                const depth = match?match[0].length:0;
                if(/^#+ .*/.test(editor.getLine(cursor.line))){
                    menu
                        .addSeparator()
                        .addItem((item) => {
                            item
                                .setTitle("将此标题重构为...")
                                .setIcon("document")
                                .onClick((event) => {
                                    if((event as MouseEvent).x && (event as MouseEvent).y){
                                        const mouseEvent = event as MouseEvent;
                                        //调整标题级别菜单
                                        const headingModifyMenu = new Menu();
                                        headingModifyMenu.addItem((item)=>{
                                            item
                                                .setTitle("取消")
                                        })
                                        headingModifyMenu.addSeparator()
                                        for(let i=1;i<=6;i++){
                                            if(i==depth){
                                                headingModifyMenu.addItem((item)=>{
                                                    item
                                                        .setTitle(`H${i} (now)`)
                                                })
                                            }
                                            else{
                                                headingModifyMenu.addItem((item)=>{
                                                    item
                                                        .setTitle(`H${i}`)
                                            })
                                            }
                                        }
                                        headingModifyMenu.addSeparator()
                                        headingModifyMenu.addItem((item)=>{
                                            item
                                                .setTitle(`List`)
                                                .setIcon('list')
                                                .onClick(()=>{
                                                    this.handle.heading_to_list(markdownView,cursor.line,false)
                                                })
                                        })
                                        headingModifyMenu.showAtPosition({ x: mouseEvent.x-15, y: mouseEvent.y-20})
                                    }
                                });
                        });
                }
            })
        );
    }

    
}

//添加设置tab
class MySettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: myPlugin,private handle:CoreHandle) {
        super(app, plugin);
    }
    display(): void {
        //获取标签页对应的容器
        const {containerEl} = this;
        containerEl.empty();

        //添加设置项
        new Setting(containerEl)
            .setName('name')
            .setDesc('desc')
            //.setTooltip('tooltip')
            .addText(text => text
                .setPlaceholder('place holder')
                .setValue(this.plugin.get_settings().testSetting1)
                .onChange(async (value) => {
                    this.plugin.set_settings({testSetting1:value});
                }));

        new Setting(containerEl)
            .setName('Format Ordered List Index')
            .addDropdown(Dropdown => Dropdown
                .addOptions({
                    'Increase from 1':'Increase from 1',
                    'Increase from any':'Increase from any',
                })
                .setValue(this.plugin.get_settings().listIndexHandleMethod as string)
                .onChange(async (value) => {
                    this.plugin.set_settings({listIndexHandleMethod:value});                   
                })
            )
                    
        new Setting(containerEl)
            .setName('Add index to titles ')
            .addDropdown(Dropdown => Dropdown
                .addOptions({
                    7:'Disabled',
                    1:'All Levels',
                    2:'Level 2 and below',
                    3:'Level 3 and below',
                    4:'Level 4 and below',
                    5:'Level 5 and below',
                    6:'Level 6',
                })
                .setValue(String(this.plugin.get_settings().addHeadingIndexFrom))
                .onChange(async (value) => {
                    this.plugin.set_settings({addHeadingIndexFrom:Number(value) as 7 | HeadingDepth})
                })
            )
    }
}