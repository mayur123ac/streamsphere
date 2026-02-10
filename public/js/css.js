const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting){
            entry.target.classList.add('show');
        }else{
            entry.target.classList.remove('show');
        }
    });
});


const hiddenElement = document.querySelectorAll('.hidden');
hiddenElement.forEach((el) => observer.observe(el));


// 123
const observer2 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting){
            entry.target.classList.add('show1');
        }else{
            entry.target.classList.remove('show1');
        }
    });
});


const hiddenElement1 = document.querySelectorAll('.hidden1');
hiddenElement1.forEach((el) => observer2.observe(el));


// 123
const observer3 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting){
            entry.target.classList.add('show2');
        }else{
            entry.target.classList.remove('show2');
        }
    });
});


const hiddenElement2 = document.querySelectorAll('.hidden2');
hiddenElement2.forEach((el) => observer3.observe(el));

123
const observer4 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting){
            entry.target.classList.add('show3');
        }else{
            entry.target.classList.remove('show3');
        }
    });
});


const hiddenElement3 = document.querySelectorAll('.hidden3');
hiddenElement3.forEach((el) => observer4.observe(el));