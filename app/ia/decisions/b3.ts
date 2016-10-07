export class Tree<ME, BB extends Blackboard> {
    root: Node<ME,BB>;

    tick(me: ME, blackboard: BB) {
        const t = new Tick(me, blackboard);
        this.root.tick(t);
    }

    sequence(...children: Node<ME,BB>[]): Sequence<ME,BB> {
        return new Sequence<ME,BB>(...children);
    }

    selector(...children: Node<ME,BB>[]): Sequence<ME,BB> {
        return new Selector<ME,BB>(...children);
    }

    parallel(...children: Node<ME,BB>[]): Sequence<ME,BB> {
        return new Parallel<ME,BB>(...children);
    }
}

export class BlackboardKey<T> {
    id = Symbol();
}

export class Blackboard {
    data = {};
    
    get<T>(k: BlackboardKey<T>): T {
        return <T>this.data[k.id];
    }
    set<T>(k: BlackboardKey<T>, value: T) {
        this.data[k.id] = value;
    }
    reset() {
        this.data = {};
    }
}

export class Tick<ME, BB> {
    me: ME;
    blackboard: BB;

    constructor(me: ME, b: BB) {
        this.blackboard = b;
        this.me = me;
    }
}

export enum NodeState {
    SUCCESS, FAILURE, RUNNING
}

export abstract class Node<ME,BB> {

    abstract tick(t: Tick<ME,BB>): NodeState;
}


export abstract class Branch<ME,BB> extends Node<ME,BB> {
    children: Node<ME,BB>[];
    constructor(...children: Node<ME,BB>[]) {
        super();
        this.children = children;
    }

}

export abstract class Leaf<ME,BB> extends Node<ME,BB> {

}

export class Selector<ME,BB> extends Branch<ME,BB> {

    constructor(...children: Node<ME,BB>[]) {
        super(...children);
    }
    tick(t: Tick<ME,BB>): NodeState {
        for (let c of this.children) {
            switch (c.tick(t)) {
                case NodeState.SUCCESS:
                    return NodeState.SUCCESS;
                case NodeState.RUNNING:
                    return NodeState.RUNNING;
            }
        }
        return NodeState.FAILURE;
    }
}

export class Sequence<ME,BB> extends Branch<ME,BB> {

    constructor(...children: Node<ME,BB>[]) {
        super(...children);
    }
    tick(t: Tick<ME,BB>): NodeState {
        for (let c of this.children) {
            switch (c.tick(t)) {
                case NodeState.FAILURE:
                    return NodeState.FAILURE;
                case NodeState.RUNNING:
                    return NodeState.RUNNING;
            }
        }
        return NodeState.SUCCESS;
    }
}

export class Parallel<ME,BB> extends Branch<ME,BB> {
    successThreshold: number;
    failureThreshold: number;

    constructor(...children: Node<ME,BB>[]) {
        super(...children);
    }

    tick(t: Tick<ME,BB>): NodeState {
        let failures = 0, successes = 0;
        for (let c of this.children) {
            switch (c.tick(t)) {
                case NodeState.FAILURE:
                    return ++failures;
                case NodeState.SUCCESS:
                    return ++successes;
            }
        }
        if (successes >= this.successThreshold) {
            return NodeState.SUCCESS;
        } else if (failures >= this.failureThreshold) {
            return NodeState.FAILURE;
        } else {
            return NodeState.RUNNING;
        }
    }
}

export abstract class Decorator<ME,BB> extends Node<ME,BB> {
    child: Node<ME,BB>;

    constructor(child: Node<ME,BB>) {
        super();
        this.child = child;
    }
}

export abstract class Action<ME,BB> extends Leaf<ME,BB> {

}

export abstract class Condition<ME,BB> extends Leaf<ME,BB> {

    abstract check(t: Tick<ME,BB>): boolean;

    tick(t: Tick<ME,BB>): NodeState {
        if (this.check(t)) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.FAILURE;
        }
    }
}
