
$(document).ready(() => {
    $(".container").kifu({
        widthBoard : 360,
        heightBoard : 360,
        startPosition : "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -", 
        changeable : true,
        KIF : "/www/files/kifud.txt"
    });
});
 

/**
 * Возвращает массив позиций для всех ходов
 *
 * @param {moves_} moves_ Массив ходов в формате ($1_$2_$3_$4).
 *  $1 — фигура, которая ходит (превращенная фигура обозначается как (фигура)+ ), 
 *  $2 — откуда, 
 *  $3 — куда, 
 *  $4 —  тип хода (N – обычный ход, D – сбрасывание, P – превращение)
 * @param {startPosition_} startPosition_ Стартовая позиция.
 */
function movesInSfen(moves_, startPosition_){
    var sfens = [];
    var sfen = startPosition_;
    
    if (moves_.length == 0){
        sfens.push(startPosition_);
        return sfens;
    }

    sfens.push(startPosition_);
    moves_.forEach(element => {
        sfen = NFARF_TO_SFEN( UPDATE_SFEN(SFEN_TO_NFARF(sfen), element));
        sfens.push(sfen);
    });  
    
    return sfens;
}


        /**
         * Преобразует SFEN в промежуточный формат NFARF (Not Fully Abbreviated Recording Form)
         *
         * @param {sfen_} sfen_ Позиция в формате SFEN.
         * @return {nfarf} nfarf Позиция в формате NFARF.
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
         * @param {nfarf_} nfarf_ Позиция в формате NFARF.
         * @return {sfen} sfen Позиция в формате SFEN.
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
         * @param {sfen_} sfen_ Позиция в формате SFEN.
         * @param {move_} move_ Текущий ход.
         * @return {new_sfen} new_sfen Новая позиция в формате SFEN.
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
            
                default:
                    break;
            }
            
            return new_sfen;
        }

        /**
         * Обратно преобразует координаты в формат позиции (т.е верхний левый угол имеет координаты 91)
         * из координат одномерного массива (т.е верхний левый угол имеет координаты 00)
         * и преобразует в вид ID
         *
         * @param {field} field Текущее поле.
         */
        var getFieldID = (field) => '#' + reverse_convertField(field);
        
        /**
         * Обратно преобразует координаты в формат позиции (т.е верхний левый угол имеет координаты 91)
         * из координат одномерного массива (т.е верхний левый угол имеет координаты 00)
         *
         * @param {field} field Текущее поле или массив полей.
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
         * @param {field} field Текущее поле.
         */
        var convertField = (field) => ((field % 10) * 9) - Math.trunc(field / 10);

        /**
         * Проверяет переданное значение на число
         *
         * @param {n} n Проверяемое значение.
         */
        var isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);
        