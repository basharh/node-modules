
class Box {
    static int size = 5;
    public static void main(String[] args) {
        for(int i = 0; i < size; i++) {
            for(int j = 0; j < size; j++) {
                if (j == i || j == (size-1-i)) {
                    System.out.print("*");
                } else {
                    System.out.print(" ");
                }
            }
            System.out.print("\n");
        }
    }
}
