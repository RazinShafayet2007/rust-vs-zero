use std::hint::black_box;

fn main() {
    let mut i: u64 = 0;
    let mut acc: u64 = 0;

    while i < 20_000_000 {
        let value = black_box(i);
        acc = acc + ((value * 1_664_525 + 1_013_904_223) % 1_000_003);
        i += 1;
    }

    if acc == 10_000_017_000_695 {
        println!("ok");
    } else {
        println!("bad");
    }
}
