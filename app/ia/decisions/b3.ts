export class Tree<ME> {
    root: Node<ME>;

    tick(me: ME, blackboard: BlackBoard) {
        const t = new Tick(me, blackboard);
        this.root.tick(t);
    }

    sequence(...children: Node<ME>[]): Sequence<ME> {
        return new Sequence<ME>(...children);
    }

    selector(...children: Node<ME>[]): Sequence<ME> {
        return new Selector<ME>(...children);
    }

    parallel(...children: Node<ME>[]): Sequence<ME> {
        return new Parallel<ME>(...children);
    }
}

export class BlackBoard {
    data = {};
    get<T>(id: symbol | string): T {
        return <T>this.data[id];
    }
    set<T>(id: symbol | string, value: T) {
        this.data[id] = value;
    }
    reset() {
        this.data = {};
    }
}

export class Tick<ME> {
    me: ME;
    blackboard: BlackBoard;

    constructor(me: ME, b: BlackBoard) {
        this.blackboard = b;
        this.me = me;
    }
}

export enum NodeState {
    SUCCESS, FAILURE, RUNNING
}

export abstract class Node<ME> {

    abstract tick(t: Tick<ME>): NodeState;
}


export abstract class Branch<ME> extends Node<ME> {
    children: Node<ME>[];
    constructor(...children: Node<ME>[]) {
        super();
        this.children = children;
    }

}

export abstract class Leaf<ME> extends Node<ME> {

}

export class Selector<ME> extends Branch<ME> {

    constructor(...children: Node<ME>[]) {
        super(...children);
    }
    tick(t: Tick<ME>): NodeState {
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

export class Sequence<ME> extends Branch<ME> {

    constructor(...children: Node<ME>[]) {
        super(...children);
    }
    tick(t: Tick<ME>): NodeState {
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

export class Parallel<ME> extends Branch<ME> {
    successThreshold: number;
    failureThreshold: number;

    constructor(...children: Node<ME>[]) {
        super(...children);
    }

    tick(t: Tick<ME>): NodeState {
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

export abstract class Decorator<ME> extends Node<ME> {
    child: Node<ME>;

    constructor(child: Node<ME>) {
        super();
        this.child = child;
    }
}

export abstract class Action<ME> extends Leaf<ME> {

}

export abstract class Condition<ME> extends Leaf<ME> {

    abstract check(t: Tick<ME>): boolean;

    tick(t: Tick<ME>): NodeState {
        if (this.check(t)) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.FAILURE;
        }
    }
}
