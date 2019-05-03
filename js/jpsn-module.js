class JPSN {
         
    constructor(path){
        this.path = path;
        this.data = null;
        this.jpsnObject = {
            type : null,
            bookJP : null,
            bookEN : null,

            authorJP : null,
            authorEN : null,

            countMoves : null,

            position : null,

            moves : null,
            comment : null,

            result : null
        }
    }
    
    get getJpsnObject(){
        return this.jpsnObject;
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
        
        let data = this.data.replace(/[\r\n|\r|\n]/g, "").split("@").slice(1);				
    
        for (let i = 0; i < data.length; i++){
            data[i] = data[i].split(":");
            
            switch (data[i][0]) {
                case "tsume":       this.jpsnObject.type = 1; break;
                case "book-jp":     this.jpsnObject.bookJP = data[i][1].replace(/^ /, ""); break;
                case "book-en":     this.jpsnObject.bookEN = data[i][1].replace(/^ /, ""); break;
                case "author-jp":   this.jpsnObject.authorJP = data[i][1].replace(/^ /, ""); break;
                case "author-en":   this.jpsnObject.authorEN = data[i][1].replace(/^ /, ""); break;
                case "countMoves":  this.jpsnObject.countMoves = +data[i][1].replace(/^ /, ""); break;
                case "position":    this.jpsnObject.position = data[i][1].replace(/^ /, ""); break;
                case "moves":       this.jpsnObject.moves = data[i][1].replace(/[0-9]. /, "").split(/[0-9]\. /); break;
                case "result":      this.jpsnObject.result = data[i][1].replace(/^ /, ""); break;

                default:break;
            }
        }
        
        
        this.jpsnObject.moves    = this.jpsnObject.moves.map(element => element.split(" "));
        this.jpsnObject.comment  = this.jpsnObject.moves.map( element => element[1]);
        this.jpsnObject.moves    = this.jpsnObject.moves.map( element => element[0]);

        
        this.moveToReq();
        
        
        console.log("TCL: JPSN -> read -> this.jpsnObject", this.jpsnObject)
        
    }

    
    moveToReq(){
        let moves = this.jpsnObject.moves
        let newMoves = []

        moves.forEach(move => {

            let piece = {
                type : null,
                isPromote : false,
                toPromote : false,
                beating : "",
                from : null,
                to : null
            }

            if (move[0] == "+") piece.isPromote = true;
            if (move[6] == "+") piece.toPromote = true;

            if (move[1] == "*"){
                piece.type = move[0].toUpperCase();
                piece.from = '00';
                piece.to = this.numSymbolToNumNum(move.slice(2, 4));
                
                newMoves.push(`${piece.type}_${piece.from}_${piece.to}_D`)
            } 
            else {

                if (piece.isPromote){
                    piece.type = "+" + move[1].toUpperCase();
                    piece.from = this.numSymbolToNumNum(move.slice(2, 4));
                    piece.to = this.numSymbolToNumNum(move.slice(5, 7));

                    if (move[4] == "x")
                        piece.beating = "_B";
                    
                    newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N${piece.beating}`)
                }
                else{
                    piece.type = move[0].toUpperCase();
                    piece.from = this.numSymbolToNumNum(move.slice(1, 3));
                    piece.to = this.numSymbolToNumNum(move.slice(4, 6));

                    if (move[3] == "x")
                        piece.beating = "_B";
                    
                    if (piece.toPromote)
                        newMoves.push(`${piece.type}_${piece.from}_${piece.to}_P${piece.beating}`)
                    else
                        newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N${piece.beating}`)
                }
            }
        });

        this.jpsnObject.moves = newMoves;
    }

    numSymbolToNumNum(numSymbol) {
        switch (numSymbol[1]) {
            case "a": return numSymbol[0] + "1"; break;
            case "b": return numSymbol[0] + "2"; break;
            case "c": return numSymbol[0] + "3"; break;
            case "d": return numSymbol[0] + "4"; break;
            case "e": return numSymbol[0] + "5"; break;
            case "f": return numSymbol[0] + "6"; break;
            case "g": return numSymbol[0] + "7"; break;
            case "h": return numSymbol[0] + "8"; break;
            case "i": return numSymbol[0] + "9"; break;                
            default: break;
        }
    }


}