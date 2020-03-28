document.addEventListener('DOMContentLoaded', () => {
    const materialWidth = document.getElementById('material-width');
    const lambda = document.getElementById('lambda');
    const cp = document.getElementById('cp');
    const ro = document.getElementById('ro');
    const time = document.getElementById('time');
    const edgeLeft = document.getElementById('Edge-left');
    const edgeRight = document.getElementById('Edge-right');
    const quantity = document.getElementById('quantity');
    const calculateBtn = document.getElementById('calculate');
    const inputs = document.querySelectorAll('input');

    // массивы данных
    let T = [];
    let alfa = [0], beta = [0], A = [0], B = [0], C = [0], F = [0];

    document.body.addEventListener('input', (e) => {
        element = e.target.tagName;
        // проверка принадлежности к Input
        // console.log(element);
        if (element === 'INPUT') {
            checkEmpty();
            changeBorderInput();
        };
    })

    function checkEmpty() {
        // проверка всех полей на пустоту, блокировка кнопки при данном условии
        for (let i = 0; i < inputs.length; i++) {
            // console.log(inputs[i]);
            if (inputs[i].value == "") {
                calculateBtn.disabled = true;
                return;
            }
            inputs[i].style.border = ""
            calculateBtn.disabled = false;
            // enableCalculation();
            // console.log(inputs[i].value);
        }
    };

    function enableCalculation() {
        calculateBtn.disabled = false;
    }
    function changeBorderInput() {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value == "") {
                inputs[i].style.border = "1px solid red";
            }
            else {
                inputs[i].style.border = "";
            }
        }
    }

    calculateBtn.addEventListener('click', () => {
        event.preventDefault();
        // вытаскиваем значения полей

        lambdaVal = lambda.value; cpVal = cp.value; roVal = ro.value;
        timeVal = time.value; edgeLeftVal = edgeLeft.value; edgeRightVal = edgeRight.value;
        N = quantity.value; materialWidthVal = materialWidth.value;
        // определяем шаги по времени и пространству
        const h = materialWidthVal / N;
        const tau = timeVal / N;
        let i=100,j=100;
        // T[0][0] = edgeLeftVal;

        for (let i = 0; i < N; i++) {
            T[j]=[]
            for (let j = 0; j < N; j++) {
                T[j][i]=0;
                A[j] = lambdaVal / (h * h);
                B[j] = roVal * cpVal / tau + A[j];
                C[j] = lambdaVal / (h * h);
                F[j] = -((roVal * cpVal) / tau) * T[0][0];
                alfa[j + 1] = A[j] / (B[j] - C[j] * alfa[j]);
                beta[j + 1] = (C[j] * beta[j] - F[j]) / (B[j] - C[j] * alfa[j]);
                // T[N][i]=edgeRightVal;

                T[j + 1][i] = alfa[j + 1][i] * T[j][i] + beta[j + 1][i];
            }

            console.log(T[j + 1][i]);
        }
        // T[N][N];





    })

    checkEmpty();



});
