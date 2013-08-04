<?php
namespace Codelinerjs\Javascript\Loader;
/**
 * Description of TestcaseLoader
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
class TestcaseLoader
{
    protected $path;

    public function setPath($path)
    {
        $this->path = $path;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function getTestcases()
    {
        $directory = new \RecursiveDirectoryIterator($this->path);
        $iterator = new \RecursiveIteratorIterator($directory);
        $testcases = new \RegexIterator($iterator, '/^.+Test.js$/', \RecursiveRegexIterator::GET_MATCH);
        $arrayCopy = array();
        foreach($testcases as $testcase) {
            $arrayCopy[] = $this->fileToTestcase($testcase[0]);
        }

        return $arrayCopy;
    }

    protected function fileToTestcase($fileinfo)
    {
        $fileinfo = str_replace($this->path . DIRECTORY_SEPARATOR, '', $fileinfo);
        $fileinfo = str_replace(".js", '', $fileinfo);
        $fileinfo = str_replace(DIRECTORY_SEPARATOR, ".", $fileinfo);

        return "Jstest." . $fileinfo;
    }
}