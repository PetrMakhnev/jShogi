/**
 * @author Petr Makhnev <mr.makhneff@gmail.com>
 * @version 0.0.3.5
 */

(function ( $ ){
    $(function() {
        "use strict";
        var settings = {};
        var methods = {
            init : function( options ) { 

                var $this = this;

                settings = $.extend( {
                    'startPosition'     : "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -",

                    'widthBoard'        : 500,
                    'heightBoard'       : 500,
                    
                    'widthBoardWithCoord': null,
                    'heightBoardWithCoord': null,

                    'boardBorderOuter'  : 2,
                    'boardBorderInner'  : 1,

                    'widthCoordinateHorizontal'     : null,
                    'heightCoordinateHorizontal'    : null,
                    
                    'widthCoordinateVertical'       : null,
                    'heightCoordinateVertical'      : null,
                    
                    'widthHand'         : null,
                    'heightHand'        : null,

                    'marginSideHand'    : null,
                    'marginTopHand'     : null,

                    'widthBoardContainer' : null,
                    'heightBoardContainer': null,

                    'widthAllContainer' : null,
                    'heightAllContainer': null,

                    'widthKifuBlock'    : null,
                    'heightKifuBlock'   : null,

                    'colorHighlightFields' : "#FDD",

                    'changeable'        : true,
                    'sfens'             : [],
                    'moves'             : [],
                    'highlightedField'  : [],
                    'nowMove'           : 0,
                    'startMove'         : null,

                    'KIF'               : null,
                    'jPSN'              : null

                }, options);

               
                initSettingsStyles(0);

                addBoard($this);
                addInterface();
                
                let sfenAndHighlightField = movesInSfen(settings["moves"], settings["startPosition"]);
				
                settings["sfens"] = sfenAndHighlightField[0];
                settings["highlightedField"] = sfenAndHighlightField[1];
                
                setPosition(settings["sfens"][settings['nowMove']]);

                if (settings['KIF'] != null)
                    loadKIF();

                if (settings['jPSN'] != null)
                    load_jPSN();
            }
        };  


        $.fn.kifu = function( method ) {

            if ( methods[method] ) {
                return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } 
            else if ( typeof method === 'object' || ! method ) {
                return methods.init.apply( this, arguments );
            } 
            else {
                $.error( 'Метод с именем ' +  method + ' не существует для jQuery.kifu' );
            } 

        };

        var load_jPSN = () => {
            let shogiProblem = read_jPSN(openFile(settings['jPSN']))[0];
            let newPosition = read_jPSN(openFile(settings['jPSN']))[1];
            
            let movesAndHighlight = movesInSfen(shogiProblem, newPosition);
			
            settings["moves"] = shogiProblem;
            settings["sfens"] = movesAndHighlight[0];
            settings["highlightedField"] = movesAndHighlight[1];

            setPosition(settings["sfens"][settings['nowMove']]);
        }

        var read_jPSN = (text) => {
            let jPSNobject = {
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

            text = text.replace(/[\r\n|\r|\n]/g, "").split("@");
            text.splice(0, 1);

            for (let i = 0; i < text.length; i++){
                text[i] = text[i].split(":");
                
                switch (text[i][0]) {
                    case "tsume": jPSNobject.type = 1; break;
                    case "book-jp": jPSNobject.bookJP = text[i][1].replace(/^ /, ""); break;
                    case "book-en": jPSNobject.bookEN = text[i][1].replace(/^ /, ""); break;
                    case "author-jp": jPSNobject.authorJP = text[i][1].replace(/^ /, ""); break;
                    case "author-en": jPSNobject.authorEN = text[i][1].replace(/^ /, ""); break;
                    case "countMoves": jPSNobject.countMoves = +text[i][1].replace(/^ /, ""); break;
                    case "position": jPSNobject.position = text[i][1].replace(/^ /, ""); break;
                    case "moves": jPSNobject.moves = text[i][1].replace(/[0-9]. /, "").split(/[0-9]\. /); break;
                    case "result": jPSNobject.result = text[i][1].replace(/^ /, ""); break;

                    default:break;
                }

            }
            
            
            
            jPSNobject.moves = jPSNobject.moves.map(element => element.split(" "));
            jPSNobject.comment = jPSNobject.moves.map( element => element[1]);
            jPSNobject.moves = jPSNobject.moves.map( element => element[0]);
            
            var jPSNMoves = moveToReq(jPSNobject.moves);

           

            return [jPSNMoves, jPSNobject.position];
            
        }


        

        var moveToReq = (moves) => {
        
            var newMoves = [];

            moves.forEach(move => {

                let piece = {
                    type : null,
                    isPromote : false,
                    toPromote : false,
                    from : null,
                    to : null
                }

                if (move[0] == "+") piece.isPromote = true;
                if (move[6] == "+") piece.toPromote = true;

                if (move[1] == "*"){
                    piece.type = move[0].toUpperCase();
                    piece.from = '00';
                    piece.to = numSymbolToNumNum(move.slice(2, 4));
                    
                    newMoves.push(`${piece.type}_${piece.from}_${piece.to}_D`)
                } 

                if (piece.isPromote){
                    if (move[4] == "-"){
                        piece.type = move[0].toUpperCase();
                        piece.from = numSymbolToNumNum(move.slice(2, 4));
                        piece.to = numSymbolToNumNum(move.slice(5, 7));

                        newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N`)
                    }

                    if (move[4] == "x"){
                        piece.type = move[0].toUpperCase();
                        piece.from = numSymbolToNumNum(move.slice(2, 4));
                        piece.to = numSymbolToNumNum(move.slice(5, 7));

                        newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N_B`)
                    }
                }
                else{
                    if (move[3] == "-"){
                        piece.type = move[0].toUpperCase();
                        piece.from = numSymbolToNumNum(move.slice(1, 3));
                        piece.to = numSymbolToNumNum(move.slice(4, 6));

                        if (piece.toPromote)
                            newMoves.push(`${piece.type}_${piece.from}_${piece.to}_P`)
                        else
                            newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N`)
                    }

                    if (move[3] == "x"){
                        piece.type = move[0].toUpperCase();
                        piece.from = numSymbolToNumNum(move.slice(1, 3));
                        piece.to = numSymbolToNumNum(move.slice(4, 6));

                         if (piece.toPromote)
                            newMoves.push(`${piece.type}_${piece.from}_${piece.to}_P_B`)
                        else
                            newMoves.push(`${piece.type}_${piece.from}_${piece.to}_N_B`)
                    }
                }

            });

            return newMoves;            
        }
        var numSymbolToNumNum = (numSymbol) => {
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




        var initSettingsStyles = (styleNumber) => {
            
            if (styleNumber == 0){

                settings["heightBoard"] = settings["widthBoard"];

                settings["widthCoordinateHorizontal"] = settings["widthBoard"];
                settings["heightCoordinateHorizontal"] = 20;

                settings["widthCoordinateVertical"] = settings["heightCoordinateHorizontal"];
                settings["heightCoordinateVertical"] = settings["heightBoard"];

                settings["widthBoardWithCoord"] = settings["widthBoard"] + 2 * settings["boardBorderOuter"] + settings["widthCoordinateVertical"];
                settings["heightBoardWithCoord"] = settings["heightBoard"] + 2 * settings["boardBorderOuter"] + settings["heightCoordinateHorizontal"];

                settings["widthHand"] = settings["widthBoard"] / 9;
                settings["heightHand"] = settings["heightBoard"];

                settings["marginSideHand"] = 10;
                settings["marginTopHand"] = settings["heightCoordinateHorizontal"];

                settings["widthBoardContainer"] = 2*settings["widthHand"] + settings["marginSideHand"] + settings["widthBoardWithCoord"] + 2 * settings["boardBorderOuter"];
                settings["heightBoardContainer"] = settings["heightBoardWithCoord"] + settings["heightCoordinateHorizontal"] + 2 * settings["boardBorderOuter"];

                settings["widthKifuBlock"] = 250;
                settings["heightKifuBlock"] = settings["heightBoardContainer"] - 2 * (settings["heightCoordinateHorizontal"] + settings["boardBorderOuter"]);

                settings["widthAllContainer"] = 2 * (settings["widthHand"] + settings["marginSideHand"]) + settings["widthBoardWithCoord"] + 2 * settings["boardBorderOuter"] + (settings["widthKifuBlock"] + 2);
                settings["heightAllContainer"] = settings["heightBoardWithCoord"] + settings["heightCoordinateHorizontal"] + 2 * settings["boardBorderOuter"];
            
            }
        }
       
        /**
         * Добавляет разметку интерфейса
         *
        */
        var addInterface = () => {
            var $containerWithEverything = $(".containerWithEverything");
            $containerWithEverything.append("<div class='kifu'></div>");
            $("<div class='buttonsContainer'></div>").appendTo($containerWithEverything);
            
            let $buttonsContainer = $(".buttonsContainer");
            $("<button class='prev'>PREV</button>").appendTo($buttonsContainer);
            $("<button class='next'>NEXT</button>").appendTo($buttonsContainer);
            $("<button class='rotate'>ROTATE</button>").appendTo($buttonsContainer);

           
            let $information = $(".information");

            $information.append(" <div class='infoItem dataStart'></div>");
            $information.append(" <div class='infoItem dataEnd'></div>");
            $information.append(" <div class='infoItem tournament'></div>");
            $information.append(" <div class='infoItem place'></div>");
            $information.append(" <div class='infoItem timeStamp'></div>");
            $information.append(" <div class='infoItem handicap'></div>");
            $information.append(" <div class='infoItem whitePlayer'></div>");
            $information.append(" <div class='infoItem blackPlayer'></div>");
            $information.append(" <div class='infoItem debut'></div>");
           
           


            addInterfaceCSS();
            addInterfaceFunc();
        }

        /**
         * Добавляет стили интерфейса
         *
        */
        var addInterfaceCSS = () => {
            let $buttonsContainer = $(".buttonsContainer");
            $buttonsContainer.css({
                "width" : settings["widthContainer"] + "px",
                "margin": "0 auto"
            });
            
            var $movesContainer = $(".movesContainer");
            $movesContainer.css({
                "width" : "200px",
                "height": settings["heightContainer"] + "px",
                "margin": "0 auto"
            });

            var $kifu = $(".kifu");

            $kifu.css({
                "width" : settings["widthKifuBlock"] + "px",
                "height": settings["heightKifuBlock"] + "px",
                "margin-top": settings["heightCoordinateHorizontal"] + "px",
                "float" : "right"
            });
        }

        /**
         * Добавляет функциональность интерфейса
         *
        */
        var addInterfaceFunc = () => {
            var $prev = $(".prev");
            var $next = $(".next");
            var $rotate = $(".rotate");

            $next.click(function(){
                if (settings["nowMove"] < settings["sfens"].length - 1){
                    settings["nowMove"]++
                    setPosition(settings["sfens"][settings["nowMove"]]); 
                    highlightFileds(settings["highlightedField"][settings["nowMove"] - 1], 1);  

                    $(".move").css({"background-color":"#FFF"});
                    $(".move_" + settings["nowMove"]).css({"background-color":"#FDD"});
                }
            });
            
            $prev.click(function(){
                if (settings["nowMove"] > 0){
                    settings["nowMove"]--;
                    setPosition(settings["sfens"][settings["nowMove"]]); 
                    highlightFileds(settings["highlightedField"][settings["nowMove"] - 1], 1);

                    $(".move").css({"background-color":"#FFF"});
                    $(".move_" + settings["nowMove"]).css({"background-color":"#FDD"});
                }  
            });

            $rotate.click(function(){
                let $containerWithBoardAndHands = $(".containerWithBoardAndHands");
                let nowAngle = $containerWithBoardAndHands.css("transform").slice(7, -1).split(", ")[1];
                let $tableVerticalCoordinates = $(".tableCoordinatesElement");

                if (isNaN(nowAngle) || nowAngle == 0)
                    nowAngle = 180;
				else if (nowAngle == 1.22465e-16)
                    nowAngle = 0;
                
                $containerWithBoardAndHands.css({"transform": "rotate(" + (nowAngle) + "deg)"});
                $tableVerticalCoordinates.css({"transform": "rotate(" + (nowAngle) + "deg)"});
            });

            $(".kifu").on("click", ".move", function(){
                let $move = $(" .move");
                
                let $this = $(this).attr("class").split(" ")[1];
                
                var numberOfMove = $(this).attr("class").split(" ")[1].split("_")[1];
                var nowPosition = settings["sfens"][numberOfMove];
                
                settings["nowMove"] = numberOfMove;
    
                setPosition(nowPosition);
                highlightFileds(settings["highlightedField"][settings["nowMove"] - 1], 1);
                
                $move.css({"background-color":"#FFF"});
                $("." + $this).css({"background-color":"#FDD"});
            });
        }


        
        /** 
         * Подсветка полей
         * 
         * @param field Поле или массив полей
         * @param flag Флаг предварительной очистки, 1 – с предварительной очистка, 0 – без предварительной очистки
        */
        var highlightFileds = (field, flag) => {
            if (flag)
                removeHighlightFields();
            
            if (Array.isArray(field)){
                field.forEach(element => {
                    $("#" + element).css({"background-color": settings['colorHighlightFields']});
                });
            }
            else{
                $("#" + field).css({"background-color": settings['colorHighlightFields']});
            }
        }
        var removeHighlightFields = () => $("[class $= Field]").css({"background-color":"#FFF"});


        /**
         * Добавление хода в массив ходов и добавление позиции в массив позиций
         * 
         * @param settings 
         * @param newMove 
         * @param highlight 
         */ 
        var addMoveAndSfen = (settings, newMove, highlight) => {

            let sfenNow = settings["sfens"][settings["nowMove"]];

            let newSfen = makeMove(sfenNow, newMove);

            let nowCount    = +settings["moves"].length;
            let nowNumMove  = +settings["nowMove"];

            if (nowCount == nowNumMove){
                settings["moves"].push(newMove);
                settings["sfens"].push(newSfen);
                
                settings["highlightedField"].push([highlight[0], highlight[1]]);
				settings["nowMove"]++;

                setPosition(newSfen);
                highlightFileds(highlight[1], 1);
            }
            else{

                settings["moves"] = settings["moves"].slice(0, nowNumMove);
                settings["sfens"] = settings["sfens"].slice(0, nowNumMove + 1);
                settings["highlightedField"] = settings["highlightedField"].slice(0, nowNumMove);
                
                settings["nowMove"] = nowNumMove;

                settings["moves"].push(newMove);
                settings["sfens"].push(newSfen);
                settings["nowMove"]++;
                settings["highlightedField"].push([highlight[0], highlight[1]]);
                
                setPosition(newSfen);
                highlightFileds(highlight[1], 1);
            }
        }

        /**
         * Функция обработчик ходов
         *
        */
        var onMove = () => {   

            var $pieceOnBoard = $('.piece').filter('.board');
            var $pieceInHand = $('.piece').filter('.hand');

            var $fieldBoard = $(".tableBoardField");

            var selectPieceIs = false;
            var selectPieceHandIs = false;
            var $selectPiece = null;

            var $selectPiece_Opponent = null;

            var $piece = null;
            var $field = null;

            var allowedFields;


            if ( settings["changeable"]){
                
                $pieceOnBoard.click(function(){
                    
                    let sfenNow = settings["sfens"][settings["nowMove"]];              
                    
                    let sfenNowColor = sfenNow.split(" ")[1];
                    
                    if ($field == null && $piece == null){
                        $piece = $(this);
                        $field = $(this).parents("td");

                        let pieceColor = $piece.attr("class").split(" ")[1][0];
                        if (pieceColor == sfenNowColor){
                            selectPieceIs = true;
                            $selectPiece = $piece;
                        }
                        else{
                            selectPieceIs = false;
                        }
                    }
                    else{
                        
                        if ($field.attr("id") == $(this).parents("td").attr("id")){
                            
                            selectPieceIs = false;

                            $piece = null;
                            $field = null;
                        }
                        else if ($field.attr("id") != $(this).parents("td").attr("id")){
                            $piece = $(this);
                            $field = $(this).parents("td");

                            let pieceColor = $piece.attr("class").split(" ")[1][0];
                            if (pieceColor == sfenNowColor){
                                selectPieceIs = true;
                                $selectPiece = $piece;
                            }
                            else{
                                selectPieceIs = false;
                                $selectPiece_Opponent = $piece;
                            }
                        }
                    }
                    
                    if ($selectPiece_Opponent != null && $selectPiece != null){

                        let pieceSymbol = $selectPiece.attr("class").split(" ")[2].replace("p", "+");

                        let colorPieceFull = $selectPiece.attr("class").split(" ")[1];

                        let $selectPiece_Opponent_Field = $selectPiece_Opponent.parents("td");
                        let $selectPiece_Field = $selectPiece.parents("td");
                        
                        allowedFields = [...getAllowedFields(pieceSymbol, colorPieceFull, $selectPiece_Field.attr("id"), sfenNow)];
                        reverse_convertField(allowedFields);
                        
                        allowedFields.forEach(element => {
                            if ($selectPiece_Opponent_Field.attr("id") == element){
                                $selectPiece_Opponent_Field.empty().append($selectPiece);

                                let isPromote = false;
                                let onPromote = checkPromote($selectPiece.attr("class").split(" ")[2], $selectPiece.attr("class").split(" ")[1], $selectPiece_Field.attr("id"), $selectPiece_Opponent_Field.attr("id"));
                                if (onPromote)
                                    isPromote = confirm("Превратить фигуру?");
                                
                                let newMove;
                            
                                if (isPromote)
                                    newMove = $selectPiece.attr("class").split(" ")[2].replace("p", "+") + "_" + $selectPiece_Field.attr("id") + "_" + $selectPiece_Opponent_Field.attr("id") + "_P_B";   
                                else
                                    newMove = $selectPiece.attr("class").split(" ")[2].replace("p", "+") + "_" + $selectPiece_Field.attr("id") + "_" + $selectPiece_Opponent_Field.attr("id") + "_N_B";
                                    
                                let highlightFields = [$selectPiece_Field.attr("id"), $selectPiece_Opponent_Field.attr("id")];
                                
                                addMoveAndSfen(settings, newMove, highlightFields);

                            }
                        });
                        
                        

                        selectPieceIs = false;
                        selectPieceHandIs = false;
                        $selectPiece = null;
                        $selectPiece_Opponent = null;
                        $piece = null;
                        $field = null;
                        allowedFields = [];
                    }

                    else if (selectPieceIs) {

                        let pieceSymbol = $piece.attr("class").split(" ")[2].replace("p", "+");

                        let colorPieceFull = $piece.attr("class").split(" ")[1];

                        let field_id = $field.attr("id");
                        
                        allowedFields = [...getAllowedFields(pieceSymbol, colorPieceFull, field_id, sfenNow)];
                        reverse_convertField(allowedFields);
                    
                        highlightFileds(allowedFields, 1);
                        highlightFileds(field_id, 0);
                    }
                    else
                        removeHighlightFields();

                });

            
                $pieceInHand.click(function(){

                    selectPieceIs = false;
                    $selectPiece = null;

                    $selectPiece_Opponent = null;


                    let sfenNow = settings["sfens"][settings["nowMove"]];
                    let sfenNowColor = sfenNow.split(" ")[1];


                    if ($field == null && $piece == null){
                        $piece = $(this);
                        $field = $(this).parents("td");

                        let pieceColor = $piece.attr("class").split(" ")[1][0];
                        if (pieceColor == sfenNowColor){
                            selectPieceHandIs = true;
                            $selectPiece = $piece;
                        }
                        else
                            selectPieceHandIs = false;
                        
                    }
                    else{
                        
                        if ($field.attr("id") == $(this).parents("td").attr("id")){
                            
                            selectPieceHandIs = false;
                            
                            $piece = null;
                            $field = null;
                        }
                        else if ($field.attr("id") != $(this).parents("td").attr("id")){
                            $piece = $(this);
                            $field = $(this).parents("td");

                            let pieceColor = $piece.attr("class").split(" ")[1][0];
                            if (pieceColor == sfenNowColor){
                                selectPieceHandIs = true;
                                $selectPiece = $piece;
                            }
                            else
                                selectPieceHandIs = false;
                            
                        }
                    }

                    if (selectPieceHandIs) {                    
                        let pieceSymbol = $selectPiece.attr("class").split(" ")[2].replace("p", "+");

                        let colorPieceFull = $selectPiece.attr("class").split(" ")[1];
                        
                        allowedFields = [...getAllowedFields(pieceSymbol, colorPieceFull, -1, sfenNow)];
                        reverse_convertField(allowedFields);
                        
                        highlightFileds(allowedFields, 1);
                        highlightFileds($field.attr("id"), 0);
                    } 
                    else
                        removeHighlightFields();
                });
        

                $fieldBoard.click(function(){
                    
                    if ($(this).has(".noPiece").length){
                        if (selectPieceIs && $selectPiece_Opponent == null){
                            
                            let sfenNow = settings["sfens"][settings["nowMove"]];

                            let $selectField = $(this);
                            let $selectPiece_Field = $selectPiece.parents("td");

                            allowedFields.forEach(element => {
                                if ($selectField.attr("id") == element){
                                    

                                    let isPromote = false;

                                    let onPromote = checkPromote($selectPiece.attr("class").split(" ")[2], $selectPiece.attr("class").split(" ")[1], $selectPiece_Field.attr("id"), $selectField.attr("id"));

                                    if (onPromote)
                                        isPromote = confirm("Превратить фигуру?");
                                    

                                    let newMove;

                                    if (isPromote)
                                        newMove = $selectPiece.attr("class").split(" ")[2].replace("p", "+") + "_" + $selectPiece_Field.attr("id") + "_" + $selectField.attr("id") + "_P";   
                                    else
                                        newMove = $selectPiece.attr("class").split(" ")[2].replace("p", "+") + "_" + $selectPiece_Field.attr("id") + "_" + $selectField.attr("id") + "_N";
                                     
                                    $selectField.empty().append($selectPiece);


                                    let highlightsField = [$selectPiece_Field.attr("id"), $selectField.attr("id")];
                                
                                    addMoveAndSfen(settings, newMove, highlightsField);

                                    

                                    selectPieceIs = false;
                                    selectPieceHandIs = false;
                                    $selectPiece = null;
                                    $selectPiece_Opponent = null;
                                    $piece = null;
                                    $field = null;
                                    allowedFields = [];
                                }
                            });
                            
                        
                        }
                        else if (selectPieceHandIs){
                            let sfenNow = settings["sfens"][settings["nowMove"]];

                            let $selectField = $(this);
                            let $selectPiece_Field = $selectPiece.parents("td");
                            
                            

                            allowedFields.forEach(element => {
                                if ($selectField.attr("id") == element){
                                
                                    $selectField.empty().append($selectPiece);

                                    let newMove = $selectPiece.attr("class").split(" ")[2].replace("p", "+") + "_" + "00" + "_" + $selectField.attr("id") + "_D";
                    
                                    let highlightFields = [null, $selectField.attr("id")];

                                    addMoveAndSfen(settings, newMove, highlightFields);
                                }
                            });

                            highlightFileds($selectField.attr("id"), 1);
                            
                            selectPieceIs = false;
                            selectPieceHandIs = false;
                            $selectPiece = null;
                            $selectPiece_Opponent = null;
                            $piece = null;
                            $field = null;
                            allowedFields = [];
                        }
                    }
                });
            }
        }

        var showAllMoves = (settings) => {
            
            $(".kifu").empty();
            $(".kifu").append("<div class = 'move move_0'>Start position</div>");
            for (var i = 0; i < settings["moves"].length; i++) {
                $(".kifu").append("<div class = 'move move_" + (i + 1) + "'>" + "	" + (i + 1) + "	" + moveInKIF(settings["moves"][i], settings["moves"][i - 1]) + "</div>");
            }
            $(".move_" + i).css({"background-color":"#FDD"});
        }

        var moveInPSN = (move, movePrev) => {
            let moveArray = move.split("_");
            let piece = moveArray[0];
            let fieldFrom = fieldToNumLetter(moveArray[1]);
            let fieldTo = fieldToNumLetter(moveArray[2]);
            let type = moveArray[3];

            let beating = moveArray[4];

            switch (type) {
                case "N":
                    if (piece == "P"){
                        if (beating == undefined)
                            return "P-" + fieldTo;
                        else{
                            if (move.split("_")[2] == movePrev.split("_")[2])
                                return "P" + "x";
                            else
                                return "P" + "x" + fieldTo;                        
                        }
                    }
                    else{
                        if (beating == undefined)
                            return piece + fieldFrom + "-" + fieldTo;
                        else{
                            if (move.split("_")[2] == movePrev.split("_")[2])
                                return piece + "x";
                            else
                                return piece + fieldFrom + "x" + fieldTo;                        
                        }
                    }

                case "D": return piece + "*" + fieldTo;
                    
                case "P":
                    if (piece == "P"){
                        if (beating == undefined)
                            return "P-" + fieldTo + "+";
                        else{
                            if (move.split("_")[2] == movePrev.split("_")[2])
                                return "P" + "x" + "+";
                            else
                                return "P" + "x" + fieldTo + "+";
                        }
                    }
                    else{
                        if (beating == undefined)
                            return piece + fieldFrom + "-" + fieldTo + "+";
                        else{
                            if (move.split("_")[2] == movePrev.split("_")[2])
                                return piece + "x" + "+";
                            else
                                return piece + fieldFrom + "x" + fieldTo + "+";
                        }
                    }
            
                default: break;
            }
        }

        var moveInKIF = (move, movePrev) => {
            if (movePrev == undefined)
                movePrev = "";
            let moveArray = move.split("_");
            let piece = pieceToKanji(moveArray[0]);
            let fieldFrom = moveArray[1];
            let fieldTo = fieldToNumLetterKIF(moveArray[2]);
            let type = moveArray[3];

            let beating = moveArray[4];

            switch (type) {
                case "N":
                    if (beating == undefined)
                        return fieldTo + piece + "(" + fieldFrom + ")";
                    else{
                        if (move.split("_")[2] == movePrev.split("_")[2])
                            return "同　" + piece + "(" + fieldFrom + ")";
                        else
                            return fieldTo + piece + "(" + fieldFrom + ")";
                    }

                case "D":
                    return fieldTo + piece + "打";
                    
                case "P":
                    if (beating == undefined)
                        return fieldTo + piece + "成" + "(" + fieldFrom + ") ";
                    else{
                        if (move.split("_")[2] == movePrev.split("_")[2])
                            return "同　" + piece + "成" + "(" + fieldFrom + ") ";
                        else
                            return fieldTo + piece + "成" + "(" + fieldFrom + ") ";
                    }
            
                default: break;
            }
        }

        var fieldToNumLetter = (field) => {
            switch (field[1]){
                case "1": return field[0] + "a"; break;
                case "2": return field[0] + "b"; break;
                case "3": return field[0] + "c"; break;
                case "4": return field[0] + "d"; break;
                case "5": return field[0] + "e"; break;
                case "6": return field[0] + "f"; break;
                case "7": return field[0] + "g"; break;
                case "8": return field[0] + "h"; break;
                case "9": return field[0] + "i"; break;
            }
        }

        var fieldToNumLetterKIF = (field) => {
            var newField = "";

            switch (field[0]){
                case "1": newField += "１"; break;
                case "2": newField += "２"; break;
                case "3": newField += "３"; break;
                case "4": newField += "４"; break;
                case "5": newField += "５"; break;
                case "6": newField += "６"; break;
                case "7": newField += "７"; break;
                case "8": newField += "８"; break;
                case "9": newField += "９"; break;
            }

            switch (field[1]){
                case "1": newField += "一"; break;
                case "2": newField += "二"; break;
                case "3": newField += "三"; break;
                case "4": newField += "四"; break;
                case "5": newField += "五"; break;
                case "6": newField += "六"; break;
                case "7": newField += "七"; break;
                case "8": newField += "八"; break;
                case "9": newField += "九"; break;
            }

            return newField;
        }

        var pieceToKanji = (piece) => {
            switch (piece){
                case "P": return "歩"; break;
                case "K": return "玉"; break;
                case "R": return "飛"; break;
                case "B": return "角"; break;
                case "G": return "金"; break;
                case "S": return "銀"; break;
                case "N": return "桂"; break;
                case "L": return "香"; break;


                case "+R": return "龍"; break;
                case "+B": return "馬"; break;
                case "+P": return "と"; break;
                case "+S": return "成銀"; break;
                case "+N": return "成桂"; break;
                case "+L": return "成香"; break;

            }
        }

        /**
         * Функция проверяет возможно ли на этом ходу превращение фигуры 
         *
         * @param piece Фигура которая ходит
         * @param color Цвет фигуры которая ходит
         * @param field_from Поле откуда
         * @param field_to Поле куда идет фигура
        */
        var checkPromote = (piece, color, field_from, field_to) => {
            if (piece[0] == "p") return false;
            if (piece[0] == "G") return false;

            if (color == "black")
                if (convertField(field_from) < 27 || convertField(field_to) < 27) return true; 
                else return false;       
            else if (color == "white")
                if (convertField(field_from) > 53 || convertField(field_to) > 53) return true;
                else return false;
        }

        /**
         * Добавляет разметку доски
         *
        */
        var addBoard = ($this) => {

            // var countBoard = $(".containerWithEverything").length;
            
            var _accessK = "";

            $("<div class='containerWithEverything'></div>").appendTo($this);

            var $containerWithEverything = ".containerWithEverything";

            $("<div class='containerWithBoardAndHands'></div>").appendTo($containerWithEverything);

            var $containerWithBoardAndHands = $(_accessK + " .containerWithBoardAndHands");

            $("<div class='containerWithWhiteHand'></div>").appendTo($containerWithBoardAndHands);
            $("<div class='containerWithBoard'></div>").appendTo($containerWithBoardAndHands);
            $("<div class='containerWithBlackHand'></div>").appendTo($containerWithBoardAndHands);

            var $containerWithBoard = $(_accessK + " .containerWithBoard");

             
            $containerWithBoard.append("<table class = 'tableHorizontalCoordinates'></table>");
            let $tableHorizontalCoordinates = $(".tableHorizontalCoordinates");
            $tableHorizontalCoordinates.append("<tr></tr>");
            let $boardCoordTableHorizontal_tr = $(".tableHorizontalCoordinates tr");
            for (let y = 9; y > 0; y--)
                $boardCoordTableHorizontal_tr.append("<td class = 'tableCoordinatesElement'>" + y + "</td>");



            $("<table class = 'tableBoard'></table>").appendTo($containerWithBoard);

            var $tableBoard =  $(_accessK + " .tableBoard");

            for (let y = 1; y < 10; y++) {
                $tableBoard.append("<tr class = 'tableBoardRow tableBoardRowID_" + y + "'></tr>");
                for (let x = 1; x < 10; x++) 
                    $(_accessK + " .tableBoardRowID_" + y).append("<td class = 'tableBoardField' id = '" + String(10 - x) + String(y) + "'></td>");
                 
            }

            // for (let i = 1; i < 5; i++) 
            //     $("<div class = 'circle circle_" + i + "'></div>").appendTo($containerWithBoard);

            var $containerWithWhiteHand = $(_accessK + " .containerWithWhiteHand");
            var $containerWithBlackHand = $(_accessK + " .containerWithBlackHand");

            $containerWithWhiteHand.append("<table class = 'tableHand tableWhiteHand'></table>");    
            for (let y = 1; y < 10; y++){
                $(_accessK + " .tableWhiteHand").append("<tr class = 'tableWhiteHandRow tableWhiteHandRowID_" + y + "'></tr>");
                $(_accessK + ".tableWhiteHandRowID_" + y).append("<td class = 'tableWhiteHandRowField' id = 'tableWhiteHandRowFieldID_" + String(y) + "'></td>");
            }
            
            $containerWithBlackHand.append("<table class = 'tableHand tableBlackHand'></table>"); 
            for (let y = 9; y > 0; y--){
                $(_accessK + " .tableBlackHand").append("<tr class = 'tableBlackHandRow tableBlackHandRowID_" + y + "'></tr>");
                $(_accessK + ".tableBlackHandRowID_" + y).append("<td class = 'tableBlackHandRowField' id = 'tableBlackHandRowFieldID_" + String(y) + "'></td>");
            }


            $containerWithBoard.append("<table class = 'tableVerticalCoordinates'></table>");
            let $tableVerticalCoordinates = $(".tableVerticalCoordinates");
            for (let y = 1; y < 10; y++)
                $tableVerticalCoordinates.append("<tr><td class = 'tableCoordinatesElement'>" + y + "</td></tr>");

            addBoardCSS();
            
        }
        
        /**
         * Добавляет стили доски
         *
        */
       var addBoardCSS = () => {
        let $containerWithBoardAndHands = $(".containerWithBoardAndHands");

        let $containerWithWhiteHand = $(".containerWithWhiteHand");
        let $containerWithBlackHand = $(".containerWithBlackHand");

        let $containerWithBoard = $(".containerWithBoard");

        let $tableBoard = $(".tableBoard");
        let $tableHand = $(".tableHand");

        let $tableBoardField = $(".tableBoardField");
        
        $containerWithBoard.css({
            "width" : settings["widthBoardWithCoord"] + "px",
            "height": settings["heightBoardWithCoord"] + "px",
            "margin": "0 auto",
            "float" : "left",
            "position" : "relative"
        });

        $tableBoard.css({
            "width" : settings["widthBoard"] + "px",
            "height": settings["heightBoard"] + "px",
            "border": settings["boardBorderOuter"] + "px" + " solid #000",
            "border-collapse": "collapse",
            "table-layout": "fixed",
            "float":"left"
        });

        $tableBoardField.css({
            "border": settings["boardBorderInner"] + "px" + " solid #000",
        });

        let $tableVerticalCoordinates = $(".tableVerticalCoordinates");

        $tableVerticalCoordinates.css({
            "width" : settings["widthCoordinateVertical"] + "px",
            "height": settings["heightCoordinateVertical"] + "px",
            "border-collapse": "collapse",
            "float":"left"
        });

        let $tableHorizontalCoordinates = $(".tableHorizontalCoordinates");

        $tableHorizontalCoordinates.css({
            "width" : settings["widthCoordinateHorizontal"] + "px",
            "height": settings["heightCoordinateHorizontal"] + "px",
            "border-collapse": "collapse",
            "float":"left"
        });

        let $tableCoordinatesElement = $(".tableCoordinatesElement");

        $tableCoordinatesElement.css({
            "text-align":"center",
            "font-size": "18px"
        });


        $containerWithWhiteHand.css({
            "width" : settings["widthHand"] + "px",
            "height": settings["heightHand"] + "px",
            "margin-right": settings["marginSideHand"] + "px",
            "margin-top": settings["marginTopHand"] + "px",
            "float" : "left"
        });

        $containerWithBlackHand.css({
            "width" : settings["widthHand"] + "px",
            "height": settings["heightHand"] + "px",
            "margin-left": 0 + "px",
            "margin-top": settings["marginTopHand"] + "px",
            "float" : "left"
        });

        $tableHand.css({
            "width": "inherit",
            "height": "inherit"
        });

        
        $containerWithBoardAndHands.css({
            "width": settings["widthBoardContainer"] + "px",
            "height": settings["heightBoardContainer"] + "px",
            "float" : "left"
        });

        let $containerWithEverything = $(".containerWithEverything");
    
        $containerWithEverything.css({
            "width": settings["widthAllContainer"] + "px",
            "height": settings["heightAllContainer"] + "px",
            "margin": "0 auto"
        });
        
    }

        /**
         * Добавляет стили фигур
         *
        */
        var addPiecesCSS = () => {
            var $pieceOnBoard = $(".piece");

            $pieceOnBoard.css({
                "width" : "100%",
                "height": "100%",
            });
            
            var piecesSymbolCSS = ["K", "R", "B", "G", "S", "N", "L", "P", "pR", "pB", "pS", "pN", "pL", "pP" ];
            var piecesImagePath = [
                "king",
                "rook",
                "bishop",
                "gold",
                "silver",
                "knight",
                "lance",
                "pawn",
                "dragon",
                "horse",
                "silver+",
                "knight+",
                "lance+",
                "tokin"
            ]

            for(var i = 0; i < 15; i++){
                $("." + piecesSymbolCSS[i]).css({
                    "background-image": "url(./images/shogi_pieces/svg/" + piecesImagePath[i] + ".svg)",
                    "background-size": "100% 100%",
                });     
            }
    

            $(".white").css({
                transform: "rotate(180deg)",
            });

        }

        /**
         * Устанавливает позицию по переданому SFEN
         *
         * @param sfen Позиция в формате SFEN.
         */
        var setPosition = (sfen) => {

            showAllMoves(settings);
            highlightFileds(settings["highlightedField"][settings["nowMove"] - 1], 1);

            for (let i = 0, j = 0, field = 0; i < 10; i++){

                while (sfen[j] != "/" && sfen[j] != " "){
                    if (!isNaN(+sfen[j]))
                        for (let k = 0; k < +sfen[j]; k++, field++)
                            $("<div class = 'noPiece'></div>").appendTo($(getFieldID(field)).empty());
                        
                    else{
                        let piece;

                        if (sfen[j] == "+"){

                            piece = sfen[++j];

                            if (piece === piece.toUpperCase()) 
                                piece = "black p" + piece + " board ";
                            else
                                piece = "white p" + piece.toUpperCase() + " board ";
                        }
                        else{

                            piece = sfen[j];

                            if (piece === piece.toUpperCase()) 
                                piece = "black " + piece + " board ";
                            else
                                piece = "white " + piece.toUpperCase() + " board ";
                        }
                        
                        $("<div class = 'piece " + piece + "'></div>").appendTo($(getFieldID(field)).empty());

                        field++;
                    }
                    j++;
                }
                j++;

            }

            let sfen_hand = sfen.split(" ")[2];

            let countBlackHand = 1;
            let countWhiteHand = 1;

            for (let i = 0; i < 10; i++){
                $("#tableBlackHandRowFieldID_" + i).empty();
                $("#tableWhiteHandRowFieldID_" + i).empty();
            }

            for (let i = 0; i < sfen_hand.length; i++){
                if (!isNaN(+sfen_hand[i])){

                    let piece = sfen_hand[i + 1];

                    if (piece === piece.toUpperCase()) {
                        piece = "black " + piece;
                        for (let k = 0; k < +sfen_hand[i]; k++)
                            $("<div class = 'piece " + piece + " hand'></div>").appendTo($("#tableBlackHandRowFieldID_" + countBlackHand++).empty());
                    
                    }
                    else{
                        piece = "white " + piece.toUpperCase();
                        for (let k = 0; k < +sfen_hand[i]; k++)
                            $("<div class = 'piece " + piece + " hand'></div>").appendTo($("#tableWhiteHandRowFieldID_" + countWhiteHand++).empty());
                        
                    }

                    i++;
                }
                else{
                    let piece = sfen_hand[i];
            
                    if (piece === piece.toUpperCase()) {
                        piece = "black " + piece;
                        $("<div class = 'piece " + piece + " hand'></div>").appendTo($("#tableBlackHandRowFieldID_" + countBlackHand++).empty());
                    }
                    else{
                        piece = "white " + piece.toUpperCase();
                        $("<div class = 'piece " + piece + " hand'></div>").appendTo($("#tableWhiteHandRowFieldID_" + countWhiteHand++).empty());
                    }
                }
            }

            

            addPiecesCSS();
            onMove(settings);
        }




        
        var addToAllowedFields = (allowedFields, field, colorNow, sfen_array, item, checkedField) => {
            if (field + item < 81 && field + item >= 0){
                if (colorNow && !isNumeric(sfen_array[field + item]))
                    var checkedField = sfen_array[field + item].toUpperCase();
                else if (!colorNow && !isNumeric(sfen_array[field + item]))
                    var checkedField = sfen_array[field + item].toLowerCase();
                if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                    allowedFields.push(field + item);
                else if (sfen_array[field + item] != checkedField)
                    allowedFields.push(field + item);
            }
        }

        /**
         * Возвращает массив возможных полей для хода
         *
         * @param piece_ Фигура, для которой осуществляется поиск.
         * @param color_ Цвет данной фигуры.
         * @param field_ Поле, на котором стоит эта фигура.
         * @param sfen_ Текущий SFEN партии.
         * @return allowedFields Возможные поля для хода.
        */
        function getAllowedFields(piece_, color_, field_, sfen_){
            var sfen = SFEN_TO_NFARF(sfen_);
            var field = convertField(field_);
            var sfen_array  = sfen.replace(/\//g, "").replace(/(\w)/g, "$1=").split("=")

            var allowedFields = []; 

            if (field_ == -1){
                for (let i = 0; i < 81; i++)
                    if (sfen_array[i] == 0)
                        allowedFields.push(i);
                
                return allowedFields;
            }

            switch (piece_) {
                
                case "K":
                    var possibleShiftMove = [-10, -9, -8, -1, 1, 8, 9, 10];
                    var colorNow = true;    // true — черные, false — белые

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }

                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                            possibleShiftMove.splice(5, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(3, 1);
                        }

                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(3, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                            possibleShiftMove.splice(5, 1);
                        }
                    }

                    possibleShiftMove.forEach(item => addToAllowedFields(allowedFields, field, colorNow, sfen_array, item, checkedField))
                   
                    return allowedFields;

                case "P":
                    var possibleShiftMove = [-9];
                    var colorNow = true;

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }

                    possibleShiftMove.forEach(item => addToAllowedFields(allowedFields, field, colorNow, sfen_array, item, checkedField))



                    return allowedFields;

                
                case "G":
                case "+S":
                case "+N":
                case "+L":
                case "+P":
                    var possibleShiftMove = [-10, -9, -8, -1, 1, 9];
                    var colorNow = true;

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }
                    
                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                        }

                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                        }

                    }

                    possibleShiftMove.forEach(item => addToAllowedFields(allowedFields, field, colorNow, sfen_array, item, checkedField))

                    return allowedFields;

                case "S":

                    var possibleShiftMove = [-10, -9, -8, 8, 10];
                    var colorNow = true;

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }

                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                        }
                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(0, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(2, 1);
                        }
                    }

                    possibleShiftMove.forEach(item => addToAllowedFields(allowedFields, field, colorNow, sfen_array, item, checkedField))

                    return allowedFields;

                case "N":

                    var possibleShiftMove = [-19, -17];
                    var colorNow = true;

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }

                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                        }

                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                        }

                    }

                    possibleShiftMove.forEach(item => addToAllowedFields(allowedFields, field, colorNow, sfen_array, item, checkedField))

                    return allowedFields;

                case "L":

                    var possibleShiftMove = [-9];
                    var colorNow = true;

                    if (color_ == "white"){
                        possibleShiftMove = possibleShiftMove.map(item => item * -1)
                        colorNow = false;
                    }  
                    
                    for (let i = 1; i < 9; i++){
                        let item = possibleShiftMove[0] * i;
                        
                        if (colorNow && !isNumeric(sfen_array[field + item]))
                            var checkedField = sfen_array[field + item].toUpperCase();
                        else if (!colorNow && !isNumeric(sfen_array[field + item]))
                            var checkedField = sfen_array[field + item].toLowerCase();

                        if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                            allowedFields.push(field + item);
                        else if (sfen_array[field + item] != checkedField){
                            allowedFields.push(field + item);
                            break;
                        }
                        else
                            break;
                    }

                    return allowedFields;

                    break;

                case "R":

                    var possibleShiftMove = [-9, 9, 1, -1];
                    var colorNow = true;

                    if (color_ == "white")
                        colorNow = false;
                    
                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(2, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                        }

                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(2, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                        }


                    }

                    possibleShiftMove.forEach(function(item_) {    

                        for (let i = 1; i < 9; i++){
                            let item = item_ * i;

                            if (field + item < 81 && field + item >= 0){
                            
                                if (item_ == 1)
                                    if ((field + item) % 9 == 0)
                                        break;

                                if (item_ == -1)
                                    if ((field + item + 1) % 9 == 0)
                                        break;
                                

                                if (colorNow && !isNumeric(sfen_array[field + item]))
                                    var checkedField = sfen_array[field + item].toUpperCase();
                                else if (!colorNow && !isNumeric(sfen_array[field + item]))
                                    var checkedField = sfen_array[field + item].toLowerCase();

                                if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                                    allowedFields.push(field + item);
                                else if (sfen_array[field + item] != checkedField){
                                    allowedFields.push(field + item);
                                    break;
                                }
                                else
                                    break;
                            }
                            else{
                                break;
                            }
                        }
                    });

                    return allowedFields;

                case "+R":

                    var possibleShiftMove = [-9, 9, 1, -1, -8, -10, 8, 10];
                    var colorNow = true;

                    if (color_ == "white") 
                        colorNow = false;
                
                    var sep = 4;

                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(2, 1);
                            sep--;

                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(5, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            sep--;

                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(4, 1);
                        }
                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(2, 1);
                            sep--;

                            possibleShiftMove.splice(3, 1);
                            possibleShiftMove.splice(5, 1);

                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(3, 1);
                            sep--;

                            possibleShiftMove.splice(4, 1);
                            possibleShiftMove.splice(4, 1);

                        }
                    }

                    
                    possibleShiftMove.forEach(function(item_, i) {    

                        if (i < sep){

                            for (let i = 1; i < 9; i++){
                                let item = item_ * i;


                                if (field + item < 80 && field + item >= 0){
                                
                                    if (item_ == 1)
                                        if ((field + item) % 9 == 0)
                                            break;

                                    if (item_ == -1)
                                        if ((field + item + 1) % 9 == 0)
                                            break;
                                    

                                    if (colorNow && !isNumeric(sfen_array[field + item]))
                                        var checkedField = sfen_array[field + item].toUpperCase();
                                    else if (!colorNow && !isNumeric(sfen_array[field + item]))
                                        var checkedField = sfen_array[field + item].toLowerCase();

                                    if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                                        allowedFields.push(field + item);
                                    else if (sfen_array[field + item] != checkedField){
                                        allowedFields.push(field + item);
                                        break;
                                    }
                                    else
                                        break;
                                }
                                else{
                                    break;
                                }
                            }
                        }
                        else
                            addToAllowedFields(item_, checkedField);
                        
                    });

                    return allowedFields;

                case "B":

                    var possibleShiftMove = [-10, -8, 8, 10];
                    var colorNow = true;

                    if (color_ == "white") 
                        colorNow = false;
                
                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                            possibleShiftMove.splice(2, 1);
                            
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(1, 1);
                        }
                    }
                    else{

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                            possibleShiftMove.splice(2, 1);
                            
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(1, 1);
                        }
                    }
                    
                    possibleShiftMove.forEach(function(item_, i) {    
                
                        for (let i = 1; i < 9; i++){
                            let item = item_ * i;
                        
                            
                            if (field + item < 81 && field + item >= 0){

                                if (item_ == 8)
                                    if ((field + item + 1) % 9 == 0)
                                        break;

                                if (item_ == -10)
                                    if ((field + item + 1) % 9 == 0)
                                        break;

                                if (item_ == -8)
                                    if ((field + item) % 9 == 0)
                                        break;       
                                        
                                if (item_ == 10)
                                    if ((field + item) % 9 == 0)
                                        break;  
                                
                                
                            
                                if (colorNow && !isNumeric(sfen_array[field + item]))
                                    var checkedField = sfen_array[field + item].toUpperCase();
                                else if (!colorNow && !isNumeric(sfen_array[field + item]))
                                    var checkedField = sfen_array[field + item].toLowerCase();

                                if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                                    allowedFields.push(field + item);
                                else if (sfen_array[field + item] != checkedField){
                                    allowedFields.push(field + item);
                                    break;
                                }
                                else
                                    break;
                            }
                            else{   
                                break;
                            }
                        }
                        
                    });
                    return allowedFields;

                case "+B":

                    var possibleShiftMove = [-10, -8, 8, 10, -9, -1, 9, 1];
                    var colorNow = true;

                    if (color_ == "white")
                        colorNow = false;
                    
                    var sep = 4;

                    if (colorNow){

                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                            possibleShiftMove.splice(2, 1);

                            sep -= 2;

                            possibleShiftMove.splice(5, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(1, 1);

                            sep -= 2;

                            possibleShiftMove.splice(3, 1);
                        }
                    }
                    else{
                        
                        if ((field + 1) % 9 == 0){
                            possibleShiftMove.splice(1, 1);
                            possibleShiftMove.splice(2, 1);

                            sep -= 2;

                            possibleShiftMove.splice(5, 1);
                        }
                        
                        if (field % 9 == 0){
                            possibleShiftMove.splice(0, 1);
                            possibleShiftMove.splice(1, 1);

                            sep -= 2;

                            possibleShiftMove.splice(3, 1);
                        }

                    }

                    possibleShiftMove.forEach(function(item_, i) { 
                        
                        if (i < sep){
                            for (let i = 1; i < 9; i++){
                                let item = item_ * i;
                         
                                if (field + item < 81 && field + item >= 0){

                                    if (item_ == 8)
                                        if ((field + item + 1) % 9 == 0)
                                            break;

                                    if (item_ == -10)
                                        if ((field + item + 1) % 9 == 0)
                                            break;

                                    if (item_ == -8)
                                        if ((field + item) % 9 == 0)
                                            break;       
                                            
                                    if (item_ == 10)
                                        if ((field + item) % 9 == 0)
                                            break;   
                                
                                    if (colorNow && !isNumeric(sfen_array[field + item]))
                                        var checkedField = sfen_array[field + item].toUpperCase();
                                    else if (!colorNow && !isNumeric(sfen_array[field + item]))
                                        var checkedField = sfen_array[field + item].toLowerCase();

                                    if (sfen_array[field + item] == 0 || isNumeric(sfen_array[field + item]))
                                        allowedFields.push(field + item);
                                    else if (sfen_array[field + item] != checkedField){
                                        allowedFields.push(field + item);
                                        break;
                                    }
                                    else
                                        break;
                                }
                                else{   
                                    break;
                                }
                            }
                        
                        }
                        else
                            addToAllowedFields(item_, checkedField);
                           
                    });

                    return allowedFields;

                default: break;
            }

        }



        /**
         * Возвращает массив позиций для всех ходов
         *
         * @param moves_ Массив ходов в формате ($1_$2_$3_$4_$5).
         *  $1 — фигура, которая ходит (превращенная фигура обозначается как (фигура)+ ), 
         *  $2 — откуда, 
         *  $3 — куда, 
         *  $4 — тип хода (N – обычный ход, D – сбрасывание, P – превращение)
         *  $5 – флаг, если фигура этим ходом съедает фигуру
         * @param startPosition_ Стартовая позиция.
         */
        function movesInSfen(moves_, startPosition_){
            var sfens = [];
            var sfen = startPosition_;
            
            var highlightedFields = [];

            if (moves_.length == 0){
                sfens.push(startPosition_);
                highlightedFields = [];
                return [sfens, highlightedFields];
            }

            sfens.push(startPosition_);
            moves_.forEach(element => {
                sfen = makeMove(sfen, element);
                sfens.push(sfen);

                highlightedFields.push([element.split("_")[1], element.split("_")[2]]);
            });  

            return [sfens, highlightedFields];
        }

        /**
         * Преобразует текущий SFEN в соотвествии с переданным ходом
         *
         * @param sfen Позиция в формате SFEN.
         * @param move Текущий ход.
         * @return new_sfen Новый SFEN.
         */
        var makeMove = (sfen, move) => NFARF_TO_SFEN( UPDATE_SFEN(SFEN_TO_NFARF(sfen), move));
        
        /**
         * Преобразует SFEN в промежуточный формат NFARF (Not Fully Abbreviated Recording Form)
         *
         * @param sfen_ Позиция в формате SFEN.
         * @return nfarf Позиция в формате NFARF.
         */
        function SFEN_TO_NFARF(sfen_){ // Not Fully Abbreviated Recording Form
		
            var nfarf = "";
            var sfen = sfen_.split(" ")[0];
				
            var nowColor = sfen_.split(" ")[1];
            var sfen_hand = sfen_.split(" ")[2];

            for (var i = 0; i < sfen.length; i++){
                if (!isNaN(+sfen[i]))
                    for (var k = 0; k < +sfen[i]; k++)
                        nfarf += "0";
                else
                    nfarf += sfen[i];
            }

            nfarf += " " + nowColor + " ";

            for (var i = 0; i < sfen_hand.length ; i++){
                if (!isNaN(+sfen_hand[i]))
                    for (var k = 0; k < +sfen_hand[i] - 1; k++)
                        nfarf += sfen_hand[i + 1];
                else
                    nfarf += sfen_hand[i];
            }
            
			
            return nfarf;
        }

        /**
         * Преобразует NFARF (Not Fully Abbreviated Recording Form) в SFEN
         *
         * @param nfarf_ Позиция в формате NFARF.
         * @return sfen Позиция в формате SFEN.
         */
        function NFARF_TO_SFEN(nfarf_) {
            var sfen = "";
            var nfarf = nfarf_.split(" ")[0];
            var nowColor = nfarf_.split(" ")[1];
            var nfarf_hand = nfarf_.split(" ")[2];

            for (var i = 0; i < nfarf.length; i++){

                let count = 0;

                if (nfarf[i] == "0"){
                    while (nfarf[i] == "0"){
                        count++;
                        i++;
                    }
                    sfen += count;
                    count = 0;
                    i--;
                }
                else
                    sfen += nfarf[i];
            }

            sfen += " " + nowColor + " ";

            for (var i = 0; i < nfarf_hand.length; i++){
                let temp = nfarf_hand[i];
                let count = 0;

                if (nfarf_hand[i + 1] == temp){
                    while (nfarf_hand[i] == temp){
                        count++;
                        i++;
                    }
                    i--;
                    sfen += count;
                    sfen += temp;
                    count = 0;
                }
                else
                    sfen += temp;
            }
            
            return sfen;
        }

        /**
         * Преобразует переданный SFEN в соотвествии с переданным ходом
         *
         * @param sfen_ Позиция в формате SFEN.
         * @param move_ Текущий ход.
         * @return new_sfen Новая позиция в формате SFEN.
         */
        function UPDATE_SFEN(sfen_, move_) {
			
            
            var moveSplit   = move_.split("_");
            var piece       = moveSplit[0];
            var field_from  = convertField(moveSplit[1]);
            var field_to    = convertField(moveSplit[2]);  
            var type        = moveSplit[3];

            var beating     = moveSplit[4];

            var sfen        = sfen_.split(" ")[0];
            var nowColor    = sfen_.split(" ")[1];
            var hand        = sfen_.split(" ")[2];
            var sfen_array  = sfen.replace(/\//g, "").replace(/(\w)/g, "$1=").split("=")

            var new_sfen    = "";

            switch (type) {
                case "N":   // обычный ход

                    if (sfen_array[field_to] != 0){

                        let newPiece = sfen_array[field_to].replace("+", "");
                        
                        if (nowColor == "b") 
                            newPiece = newPiece.toUpperCase(); 
                        else 
                            newPiece = newPiece.toLowerCase();
                    
                        hand = hand.replace("-", "");
                        hand += newPiece;
                    } 

                    if (nowColor == "b") nowColor = "w"; else nowColor = "b";

                    sfen_array[field_to] = sfen_array[field_from];
                    sfen_array[field_from] = 0;

                    for (let i = 1; i < 9; i++)
                        sfen_array.splice(9 * i + (i - 1), 0, "/");

                    new_sfen = sfen_array.join("");
                    new_sfen += " " + nowColor + " " + hand;
                    
                    break;

                case "D":   // сбрасывание

                    let newPiece = piece;
                    
                    if (nowColor == "b") {
                        newPiece = newPiece.toUpperCase(); 
                        nowColor = "w";
                    }
                    else {
                        newPiece = newPiece.toLowerCase();
                        nowColor = "b"
                    }

                    sfen_array[field_to] = newPiece;

                    for (let i = 1; i < 9; i++)
                        sfen_array.splice(9 * i + (i - 1), 0, "/");

                    hand = hand.replace(newPiece, "");
                    
                    new_sfen = sfen_array.join("");
                    new_sfen += " " + nowColor + " " + hand;

                    break;

                case "P":   // превращение

                    if (sfen_array[field_to] != 0){

                        let newPiece = sfen_array[field_to].replace("+", "");
                        

                        if (nowColor == "b") 
                            newPiece = newPiece.toUpperCase(); 
                        else 
                            newPiece = newPiece.toLowerCase();
                        
                        hand = hand.replace("-", "");
                        hand += newPiece;
                        
                    }

                    if (nowColor == "b") nowColor = "w"; else nowColor = "b";
                    
                    sfen_array[field_to] = "+" + sfen_array[field_from];
                    sfen_array[field_from] = 0;

                    for (let i = 1; i < 9; i++)
                        sfen_array.splice(9 * i + (i - 1), 0, "/");

                    new_sfen = sfen_array.join("");
                    new_sfen += " " + nowColor + " " + hand;

                    

                    break;
            
                default: break;
            }
            
            return new_sfen;
        }

        /**
         * Обратно преобразует координаты в формат позиции (т.е верхний левый угол имеет координаты 91)
         * из координат одномерного массива (т.е верхний левый угол имеет координаты 00)
         * и преобразует в вид ID
         *
         * @param field Текущее поле.
         */
        var getFieldID = (field) => '#' + reverse_convertField(field);
        
        /**
         * Обратно преобразует координаты в формат позиции (т.е верхний левый угол имеет координаты 91)
         * из координат одномерного массива (т.е верхний левый угол имеет координаты 00)
         *
         * @param field Текущее поле или массив полей.
         */
        var reverse_convertField = (field) => {
            if (Array.isArray(field))
                for (let i = 0; i < field.length; i++)
                    field[i] = reverse_convertField(field[i]);
            else
                return ((9 - (field - Math.floor(field / 9) * 9)) * 10 + (1 + Math.floor(field / 9)))
        };
        
        /**
         * Преобразует координаты заданные в формате позиции (т.е верхний левый угол имеет координаты 91)
         * в координаты одномерного массива (т.е верхний левый угол имеет координаты 00)
         *
         * @param field Текущее поле.
         */
        var convertField = (field) => ((field % 10) * 9) - Math.trunc(field / 10);

        /**
         * Проверяет переданное значение на число
         *
         * @param n Проверяемое значение.
         */
        var isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);
        

        // БЛОК ЧТЕНИЯ ФАЙЛОВ //

        // РАБОТА С KIF // 

        /**
         * Загружает KIF и устанавливает первоначальную позицию
         */
        var loadKIF = () => {
        
            settings['moves'] = readKIF(openFile(settings['KIF']));
            
            let sfenAndHighlightField = movesInSfen(settings["moves"], settings["startPosition"]);
            settings["sfens"] = sfenAndHighlightField[0];
            settings["highlightedField"] = sfenAndHighlightField[1];
        
            if (settings['startMove'] != null) {
                if (settings['startMove'] <= settings['moves'].length){ 
                    settings['nowMove'] = settings['startMove'];
                    setPosition(settings['sfens'][settings['nowMove']]);
                }
                else
                    alert(`Номер хода указан неверно, установлена стартовая позиция!\nВсего ходов: ${settings['moves'].length}`);
            }
        }

        /**
         * Преобразует KIF в массив ходов внутреннего представления
         *
         * @param KIF Преобразуемый файл.
        */
        var readKIF = (KIF) => {
            
            var lines = KIF.split('\n');
        
            let startMoveFlag = "数";
            let startLine = 0;
            for (let i = 0; lines[i][1] != startMoveFlag; i++)
                startLine++;
            

            var information = {};
            var informationData = lines.slice(0, startLine);

            var isKanji = (str) => !/[а-яa-z]/i.test(str);
            
            

            for (let i = 0; i < informationData.length; i++){
                let el;
                switch (informationData[i][0]) {
                    case "開":
                        information["dataStart"] = {
                            "day" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                            "time" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                        }
                        break;

                    case "終":
                        information["dataEnd"] = {
                            "day" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                            "time" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                        }
                        break;

                    case "棋": information["tournament"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                    case "場": information["place"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                    case "持": information["timeStamp"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                    case "手": information["handicap"] = informationData[i].replace(/.*：(.*)/, "$1"); break;

                    case "先":
                        el = informationData[i].replace(/.*：(.*)/, "$1");
						
                        if (isKanji(el)){
                            information["white"] = {
                                "name" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                                "rank" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                            };
                        }
                        else{
                            information["white"] = {
                                "name" : informationData[i].replace(/.*：(.*)/, "$1")
                            }
                        }
                      
                        break;

                    case "後":
                        el = informationData[i].replace(/.*：(.*)/, "$1");
                        if (isKanji(el)){
                            information["black"] = {
                                "name" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[0],
                                "rank" : informationData[i].replace(/.*：(.*)/, "$1").split(" ")[1]
                            };
                        }
                        else{
                            information["black"] = {
                                "name" : informationData[i].replace(/.*：(.*)/, "$1")
                            }
                        }
                        break;

                    case "戦": information["debut"] = informationData[i].replace(/.*：(.*)/, "$1");break;
                
                    default: break;
                }
            }
            
        
            let moves = lines.slice(startLine + 1);
		
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
                    fieldTo += kanjiToString(move[0]) + kanjiToString(move[1]);
                
                if (move[2] == "成") {
                    piece = "+" + kanjiToString(move[3]);
                    type = "N";
                }
                else {
                    piece = kanjiToString(move[2]);
                    type = kanjiToString(move[3]);

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
            

            let $dataStart = $(".dataStart");
            let $dataEnd = $(".dataEnd");
            let $tournament = $(".tournament");
            let $place = $(".place");
            let $timeStamp = $(".timeStamp");
            let $handicap = $(".handicap");
            let $white = $(".whitePlayer");
            let $black = $(".blackPlayer");
			console.log("TCL: readKIF -> $black", $black)
            let $debut = $(".debut");
			console.log("TCL: readKIF ->  $debut",  $debut)
            
            $dataStart.html(information["dataStart"]);
			console.log("TCL: readKIF -> information", information)
            $dataEnd.html(information["dataEnd"]);
            $tournament.html(information["tournament"]);
            $place.html(information["place"]);
            $timeStamp.html(information["timeStamp"]);
            $handicap.html(information["handicap"]);
            $white.html(information["white"].name);
            $black.html(information["black"].name);
            $debut.html(information["debut"]);
            
            
            return newMoves;
        }

        /**
         * Вспомогательная функция для чтения KIF
         * Преобразует иероглифы в ходе в соотвествии с их значением
         *
         * @param kanji Преобразуемый иероглиф.
        */
        var kanjiToString = (kanji) => {
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

        /**
         * Функция открытия файла
         *
         * @param path Путь у файлу.
         * @return Возвращает данные из файла в виде строки.
        */
        var openFile = (path) => {
       
            var information;  
             
            $.ajax({
                url: path,
                dataType: 'text',
                async: false,
                success: function(data){
                    information = data;
                }
            });
            return information;
        }
    });
}) (jQuery)