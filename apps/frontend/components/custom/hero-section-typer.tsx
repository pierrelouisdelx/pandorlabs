'use client';

import React, { useCallback, useEffect } from 'react';

const HeroSectionTyper = () => {
    const TyperClass: any = useCallback(function (this: any, element: HTMLElement) {
        this.element = element;
        const delim = element.dataset.delim || ',';
        const words = element.dataset.words || 'override these,sample typing';
        this.words = words.split(delim).filter((v: string) => v);
        this.delay = element.dataset.delay || 200;
        this.loop = element.dataset.loop || 'true';
        if (this.loop === 'false') {
            this.loop = 1;
        }
        this.deleteDelay = element.dataset.deletedelay || element.dataset.deleteDelay || 800;

        this.progress = { word: 0, char: 0, building: true, looped: 0 };
        this.typing = true;

        const colors = element.dataset.colors || 'black';
        this.colors = colors.split(',');
        this.element.style.color = this.colors[0];
        this.colorIndex = 0;

        this.doTyping();
    }, []);

    TyperClass.prototype.start = function () {
        if (!this.typing) {
            this.typing = true;
            this.doTyping();
        }
    };

    TyperClass.prototype.stop = function () {
        this.typing = false;
    };

    TyperClass.prototype.doTyping = function () {
        var e = this.element;
        var p = this.progress;
        var w = p.word;
        var c = p.char;
        var currentDisplay = [...this.words[w]].slice(0, c).join('');
        var atWordEnd;
        if (this.cursor) {
            this.cursor.element.style.opacity = '1';
            this.cursor.on = true;
            clearInterval(this.cursor.interval);
            this.cursor.interval = setInterval(() => this.cursor.updateBlinkState(), 400);
        }

        e.innerHTML = currentDisplay;

        if (p.building) {
            atWordEnd = p.char === this.words[w].length;
            if (atWordEnd) {
                p.building = false;
            } else {
                p.char += 1;
            }
        } else {
            if (p.char === 0) {
                p.building = true;
                p.word = (p.word + 1) % this.words.length;
                this.colorIndex = (this.colorIndex + 1) % this.colors.length;
                this.element.style.color = this.colors[this.colorIndex];
            } else {
                p.char -= 1;
            }
        }

        if (p.word === this.words.length - 1) {
            p.looped += 1;
        }

        if (!p.building && this.loop <= p.looped) {
            this.typing = false;
        }

        setTimeout(
            () => {
                if (this.typing) {
                    this.doTyping();
                }
            },
            atWordEnd ? this.deleteDelay : this.delay
        );
    };

    const createCursor: any = useCallback(function (this: any, element: HTMLElement) {
        this.element = element;
        this.cursorDisplay = element.dataset.cursordisplay || element.dataset.cursorDisplay || '_';
        element.innerHTML = this.cursorDisplay;
        this.on = true;
        element.style.transition = 'all 0.1s';
        this.interval = setInterval(() => this.updateBlinkState(), 400);
    }, []);

    createCursor.prototype.updateBlinkState = function () {
        if (this.on) {
            this.element.style.opacity = '0';
            this.on = false;
        } else {
            this.element.style.opacity = '1';
            this.on = true;
        }
    };

    useEffect(() => {
        const TyperSetup = () => {
            const typers: { [key: string]: any } = {};
            const typerElements = document.getElementsByClassName('typer');
            const stopElements = document.getElementsByClassName('typer-stop');
            const startElements = document.getElementsByClassName('typer-start');
            const cursorElements = document.getElementsByClassName('cursor');

            for (let i = 0; i < typerElements.length; i++) {
                const e = typerElements[i] as HTMLElement;
                typers[e.id] = new TyperClass(e);
            }

            for (let i = 0; i < stopElements.length; i++) {
                const e = stopElements[i] as HTMLElement;
                const owner = typers[e.dataset.owner as string];
                e.onclick = () => owner.stop();
            }

            for (let i = 0; i < startElements.length; i++) {
                const e = startElements[i] as HTMLElement;
                const owner = typers[e.dataset.owner as string];
                e.onclick = () => owner.start();
            }

            for (let i = 0; i < cursorElements.length; i++) {
                const e = cursorElements[i] as HTMLElement;
                const t = new createCursor(e);
                t.owner = typers[e.dataset.owner as string];
                t.owner.cursor = t;
            }
        };

        TyperSetup();
    }, [createCursor, TyperClass]);

    return (
        <>
            <span
                className="typer bg-linear-to-l from-green-100 to-green-light bg-clip-text text-transparent!"
                id="main-typer"
                data-words="Image Generator, Audio Generator, Video Generator"
                data-delay="100"
                // data-colors="#FF6F42"
                data-deletedelay="1000"
                data-loop="true"
            ></span>
            <span className="cursor bg-linear-to-l from-green-100 to-green-light bg-clip-text text-transparent!" data-cursordisplay="_" data-owner="main-typer"></span>
        </>
    );
};

export default HeroSectionTyper;