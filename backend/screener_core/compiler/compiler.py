from .logical_compiler import build_logic_tree
from .temporal_compiler import apply_time_windows

def compile_dsl(dsl):
    tree = build_logic_tree(dsl["conditions"])
    return apply_time_windows(tree)
