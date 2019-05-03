class KIF {

    constructor(path){
        this.path = path;
        this.data = null;

        this.kifObject = {};
    }

    get getKifObject(){
        return this.kifObject;
    }

    openThis(){
        let information;  
        $.ajax({
            url: this.path,
            dataType: 'text',
            async: false,
            success: data => information = data
        });
        this.data = information
    }

    read(){
        this.openThis();
        
        let data = this.data.split('\n');

        let startMoveFlag = "数";
        let startLine = 0;
        for (let i = 0; data[i][1] != startMoveFlag; i++)
            startLine++;
        

        let informationData = data.slice(0, startLine);

        var isKanji = (str) => !/[а-я\w]/i.test(str);
        
        
        for (let i = 0; i < informationData.length; i++){
            let el;
            switch (informationData[i][0]) {
                case "開":
                    this.kifObject["dataStart"] = {
                        "day" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                        "time" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                    }
                    break;

                case "終":
                    this.kifObject["dataEnd"] = {
                        "day" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                        "time" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                    }
                    break;

                case "棋": this.kifObject["tournament"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                case "場": this.kifObject["place"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                case "持": this.kifObject["timeStamp"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                case "手": this.kifObject["handicap"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                case "先":
                    el = informationData[i].replace(/.*：(.*)/, "$1");
                    
                    if (isKanji(el)){
                        this.kifObject["white"] = {
                            "name" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                            "rank" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                        };
                    }
                    else{
                        this.kifObject["white"] = {
                            "name" : informationData[i].replace(/.*：(.*)/, "$1")
                        }
                    }
                  
                    break;

                case "後":
                    el = informationData[i].replace(/.*：(.*)/, "$1");
                    if (isKanji(el)){
                        this.kifObject["black"] = {
                            "name" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                            "rank" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                        };
                    }
                    else{
                        this.kifObject["black"] = {
                            "name" : informationData[i].replace(/.*：(.*)/, "$1")
                        }
                    }
                    break;

                case "戦": this.kifObject["debut"] = informationData[i].replace(/.*：(.*)/, "$1");break;
            
                default: break;
            }
        }

        
        let moves = data.slice(startLine + 1);
		
        let newMoves = [];

        for (let i = 0; i < moves.length - 1; i++){
            
            let moveFull = moves[i];
            moveFull = moveFull.replace(/^ +/, "");
            moveFull = moveFull.replace(/ +/g, " ");

            let move = moveFull.split(" ")[1];
            let newMove = "";
            
            let piece;
            let fieldTo = "";
            let fieldFrom = "";
            let type;
            let flagFieldFrom = true;
            let beated = "";
        
           
            
            if (move[0] == "同") {
                fieldTo = newMoves[newMoves.length - 1].split("_")[2]; 
                beated = "_B";
            }
            else 
                fieldTo += this.kanjiToString(move[0]) + this.kanjiToString(move[1]);
            
            if (move[2] == "成") {
                piece = "+" + this.kanjiToString(move[3]);
                type = "N";
            }
            else {
                piece = this.kanjiToString(move[2]);
                type = this.kanjiToString(move[3]);

                if (type == "D")
                    flagFieldFrom = false
            }
    
            if (flagFieldFrom) 
                fieldFrom = +move.split("(")[1].split(")")[0];
            else 
                fieldFrom = "00";
            
            
            newMove = piece + "_" + fieldFrom + "_" + fieldTo + "_" + type + beated;
            
            newMoves.push(newMove);
        }

        this.kifObject.moves = newMoves;

		console.log("TCL: KIF -> read -> this.kifObject", this.kifObject)
            
    }

    kanjiToString = (kanji) => {
        switch (kanji) {
            case "玉": return("K");
            case "飛": return("R");
            case "角": return("B");
            case "金": return("G");
            case "銀": return("S");
            case "桂": return("N");
            case "香": return("L");
            case "歩": return("P");

            case "龍": return("+R");
            case "馬": return("+B");
            case "と": return("+P");

            case "一": return("1");
            case "二": return("2");
            case "三": return("3");
            case "四": return("4");
            case "五": return("5");
            case "六": return("6");
            case "七": return("7");
            case "八": return("8");
            case "九": return("9");

            case "１": return("1");
            case "２": return("2");
            case "３": return("3");
            case "４": return("4");
            case "５": return("5");
            case "６": return("6");
            case "７": return("7");
            case "８": return("8");
            case "９": return("9");

            case "　": return("");

            case "打": return("D");

            case "成": return("P");

            default: return("N");
        }
    }
}