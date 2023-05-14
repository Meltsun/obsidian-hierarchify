import {Notice} from "obsidian";


interface formattingOptions{
    addTitleIndexFrom?:number;
    listIndexHandleMethod?:string;
}

function clearIndexRecord():Array<number>{
    let array:number[]=[0,0,0,0,0,0,]
    return array
}

export function format_index(content: string[],options:formattingOptions={} ){
    let {
        addTitleIndexFrom = 6,//为#数量大于等于此值的标题添加序号
        listIndexHandleMethod = 'Disabled'//列表序号的修改方法，直接使用设置里相应选项的字符串
    }=options;

    new Notice(listIndexHandleMethod);


    //判断当前是否正在代码块里
    let isCodeBlock=false;

    //记录当前位置的标题和列表的等级
    let titleIndexes=clearIndexRecord();
    let listIndexes=clearIndexRecord();
    
    //用于判断列表序号中断
    let isBlankline=false;
    let numNormalLines=0;
    
    //逐行操作
    content.forEach((line,lineIndex,content)=>{
        //代码块的开头结尾，记录，列表等级归零
        if(line.startsWith("```")){
            isCodeBlock=!isCodeBlock;
            listIndexes=clearIndexRecord();
        }

        //代码块内部，跳过
        else if(isCodeBlock){
        }

        //表格，分割线，清空列表，跳过
        else if(/^\|? *-[ -]*\|( *-[ -]*\|)*( *-[ -]*)?/.test(line) || /^ *---+ *$/.test(line)){
            listIndexes=clearIndexRecord();
        }

        //标题
        else if(/^#+ /.test(line)){
            //清空列表
            listIndexes=clearIndexRecord();

            //计算当前行的标题等级，即#数量，不考虑6个#以上
            let level=0;
            for(let char of line){
                if(char=='#'){
                    level++;
                    if(level==6){
                        break
                    }
                }
                else{
                    break;
                }
            }

            //更新标题等级，此行对应的等级+1，更低的等级归零
            titleIndexes[level-1]++;
            for(let j=level;j<titleIndexes.length;j++){
                titleIndexes[j]=0;
            }

            //根据标题等级和设置更新标题的序号
            let indexText=' ';
            for(let j=addTitleIndexFrom;j<level;j++){
                indexText=indexText+titleIndexes[j]+'.';
            }
            content[lineIndex]=line.replace(/(?<=^#+)( +([0-9]+\.)* *)/,indexText.trimEnd()+' ');
        }

        //有序列表
        else if(/^\t*[0-9]+\. /.test(line)){
            //不修改
            if(listIndexHandleMethod=='Disabled'){
            }
            //都改成1
            else if(listIndexHandleMethod=='Always 1.'){
                content[lineIndex]=line.replace(/(?<=^\t*)[0-9]+\. +/,'1. ')
            }
            //按顺序增加
            else{
                //清零重置列表计数器
                isBlankline=false;
                numNormalLines=0;

                // 计算当前行的列表等级
                let level=1
                for(let char of line){
                    if(char=='\t'){
                        level++;
                        if(level==6){
                            break;
                        }
                    }
                    else{
                        break;
                    }
                }

                //如果允许序号从任意值开始，记录一个列表的第一个序号
                if(listIndexes[level-1]==0 && listIndexHandleMethod=='Increase from any'){
                    let index=line.match(/[0-9]+/)[0];
                    listIndexes[level-1]=Number(index);
                }//如果序号从1开始，或者当前不是一个列表的第一个需要
                else{
                    listIndexes[level-1]++;//this level`s index +1
                }

                //把更低的序号记录置为0，似乎没有用
                for(let j=level;j<listIndexes.length;j++){
                    listIndexes[j]=0;
                }

                content[lineIndex]=line.replace(/(?<=^\t*)[0-9]+\. +/,listIndexes[level-1]+'. ')
            }
        }

        //普通行
        //两个以上普通行，其中包括至少一个空行，列表序号中断
        else{
            if(line==''){
                isBlankline = true;
            }
            numNormalLines++;
            if(isBlankline && numNormalLines>=2){
                listIndexes=clearIndexRecord();
            }
        }
    })
}