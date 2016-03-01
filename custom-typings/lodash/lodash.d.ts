declare module _ {
    interface LoDashExplicitArrayWrapper<T> {
        find<TResult>(iteratee?: ListIterator<T, TResult>, thisArg?: any): LoDashExplicitWrapper<T>;
        last(): LoDashExplicitWrapper<T>;
        first(): LoDashExplicitWrapper<T>;
    }
    interface LoDashExplicitWrapper<T> {
        get(selector?: string): LoDashExplicitWrapper<any>;
    }
}
