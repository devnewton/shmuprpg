export class Tree {
    root: Node;

    tick(me: any, blackboard: BlackBoard) {
        const t = new Tick(me, blackboard);
        this.root.tick(t);
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

export class Tick {
    me: any;
    blackboard: BlackBoard;

    constructor(me: any, b: BlackBoard) {
        this.blackboard = b;
        this.me = me;
    }
}

export enum NodeState {
    SUCCESS, FAILURE, RUNNING
}

export abstract class Node {

    abstract tick(t: Tick): NodeState;
}


export abstract class Branch extends Node {
    children = new Array<Node>();

}

export abstract class Leaf extends Node {

}

export class Selector extends Branch {
    tick(t: Tick): NodeState {
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

export class Sequence extends Branch {
    tick(t: Tick): NodeState {
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

export class Parallel extends Branch {
    failureThreshold: number;
    successThreshold: number;

    tick(t: Tick): NodeState {
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

export abstract class Decorator extends Node {
    child: Node;

    constructor(child: Node) {
        super();
        this.child = child;
    }
}

export abstract class Action extends Leaf {

}

export abstract class Condition extends Leaf {

    abstract check(t: Tick): boolean;

    tick(t: Tick): NodeState {
        if (this.check(t)) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.FAILURE;
        }
    }
}
