/**
 * Created by mikey on 2016/8/1.
 */
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

/**
 * 利用正则表达式统计代码中的（代码行数，注释行数，空白行数）
 *
 * @desc: regulardemo
 * @author: kpchen
 * @createTime: 2014年11月8日 下午4:36:21
 * @history:
 * @version: v1.0
 */
public class Test {

    static long normalLines = 0;
    static long commentLines = 0;
    static long whiteLines = 0;

    public static void main(String[] args) {
        File file = new File("C:\\Users\\mikey\\code\\ndp\\hunk\\pmdr\\walle-java\\src\\test\\java\\Test.java");
        parse(file);
        System.out.println("normalLines:" + normalLines);
        System.out.println("commentLines:" + commentLines);
        System.out.println("whiteLines:" + whiteLines);

    }

    private static void parse(File f) {
        BufferedReader br = null;
        boolean comment = false;
        try {
            br = new BufferedReader(new FileReader(f));
            String line = "";
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("/*") && !line.endsWith("*/")) {
                    commentLines++;
                    comment = true;
                    System.out.println(line);
                } else if (line.startsWith("/*") && line.endsWith("*/")) {
                    commentLines++;
                    System.out.println(line);
                } else if (true == comment) {
                    commentLines++;
                    if (line.endsWith("*/")) {
                        comment = false;
                    }
                    System.out.println(line);
                } else if (line.startsWith("//")) {
                    commentLines++;
                    System.out.println(line);
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                    br = null;
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

}