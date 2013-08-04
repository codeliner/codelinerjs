<?php

namespace Codelinerjs\Javascript;

use Codelinerjs\Javascript\Loader\AbstractLoader;

class Loader extends AbstractLoader {

    public function __construct($stage = null) {
        if (null === $stage)
            $stage = "production";

        $this->loadDefaultPath();
        $this->setStage($stage);
    }
}

?>
